import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import fs from 'fs';
import multer, { Multer } from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend the NextApiRequest type
interface NextApiRequestWithFile extends NextApiRequest {
  file: Multer.File;
}

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

export default async function handler(
  req: NextApiRequestWithFile,
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

      const results = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          const feedbackPromises = results.map((row) => {
            return prisma.feedback.create({
              data: {
                content: row,
                userId: req.user.id, // Assuming you have some way of getting the current user's id
              },
            });
          });

          try {
            await Promise.all(feedbackPromises);
            res.json({ message: 'Feedback uploaded successfully' });
          } catch (error) {
            res.status(500).send('An error occurred while processing the file');
          }
        })
        .on('error', (error) => {
          res.status(500).send('An error occurred while reading the file');
        });
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
