import React, { ChangeEvent, useRef } from 'react';

const ProfileImageUpload = ({ formik }) => {
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
        Add a profile picture
      </label>
      <div className="">
        <div className="relative w-40 h-40 mb-4">
          {formik.values.image && (
            <img
              src={formik.values.image}
              className="w-40 h-40 rounded-full absolute m-auto shadow"
              alt=""
            />
          )}
        </div>

        <div className="">
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
            select new photo
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
