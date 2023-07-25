import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import React, { ChangeEvent, useRef } from 'react';

const ProfileImageUpload = ({ formik }) => {
  const { t } = useTranslation('common');
  const imageInputRef = useRef(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result;
        formik.setFieldValue('image', base64String);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="line-clamp-3 tracking-wide block mb-2 text-gray-700 text-sm">
        {t('add-profile-picture')}
      </label>
      <div>
        <div className="relative w-36 h-36 mb-4">
          {formik.values.image ? (
            <Image
              src={formik.values.image}
              className="w-36 h-36 rounded-full absolute m-auto shadow"
              width={36}
              height={36}
              alt={t('profile-picture')}
            />
          ) : (
            <Image
              src="/user-default-profile.jpeg"
              className="w-36 h-36 rounded-full absolute m-auto shadow"
              alt={t('profile-picture')}
              width={36}
              height={36}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          )}
        </div>
        <div>
          <input
            type="file"
            id="cover_image"
            className="sr-only"
            ref={imageInputRef}
            onChange={(e) => handleImageChange(e)}
          />
          <label
            className="px-4 py-1 uppercase text-xs font-medium leading-6 border inline-flex flex-row justify-center items-center no-underline rounded-md cursor-pointer transition duration-200 ease-in-out shadow-sm shadow-gray-100"
            htmlFor="cover_image"
          >
            {t('new-photo')}
          </label>
          {formik.touched.image && formik.errors.image && (
            <div className="text-red-500">{formik.errors.image}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
