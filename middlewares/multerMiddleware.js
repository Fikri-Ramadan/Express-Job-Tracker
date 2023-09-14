import path from 'path';
import multer from 'multer';
import DataURIParser from 'datauri/parser.js';

const storage = multer.memoryStorage();

const upload = multer({ storage });

const parser = new DataURIParser();

export const formatImage = (file) => {
  const fileExtension = path.extname(file.originalname).toString();
  return parser.format(fileExtension, file.buffer).content;
}

export default upload;
