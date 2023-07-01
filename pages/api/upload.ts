import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import fs from 'fs';
import multer, { Multer } from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend the NextApiRequest type
interface NextApiRequestWithFileAndUser extends NextApiRequest {
  file: Multer.File;
  user: {
    id: string;
    // Add any other properties that your user object might have
  };
}

// Define the shape of a row in your CSV file
interface CsvRow {
  feedbackContent: string; // Replace 'feedbackContent' with the actual column name
  // Add any other columns from your CSV file
}

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

export default async function handler(
  req: NextApiRequestWithFileAndUser,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const multerPromise = new Promise((resolve, reject) => {
      upload.single('file')(req, {}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(null);
        }
      });
    });

    try {
      await multerPromise;

      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      const results: CsvRow[] = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row: CsvRow) => results.push(row))
        .on('end', async () => {
          const feedbackPromises = results.map((row: CsvRow) => {
            return prisma.feedback.create({
              data: {
                content: row.feedbackContent, // Replace 'feedbackContent' with the actual column name
                userId: req.user.id, // Assuming you have some way of getting the current user's id
              },
            });
          });

          try {
            await Promise.all(feedbackPromises);
            res.json({ message: 'Feedback uploaded successfully' });
          } catch (error) {
            if (error instanceof Error) {
              res.status(500).send(error.message);
            } else {
              res.status(500).send('An unknown error occurred');
            }
          }
        })
        .on('error', (error) => {
          res.status(500).send('An error occurred while reading the file');
        });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send('An unknown error occurred');
      }
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
