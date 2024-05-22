import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import {prisma} from '../libs/prisma.js';
// import multer from '../libs/multer.mjs'; // Uncomment this line if needed
const { PORT } = process.env;

const createCar = async (req, res) => {
  try {
    const { name, price } = req.body;
    const image = req.file ? req.file.filename : null;
    const imageUrl = req.file ? `http://localhost:${PORT}/uploads/${image}` : null;

    const numericPrice = parseFloat(price);
    let carType;

    if (numericPrice >= 1000 && numericPrice <= 200000) {
      carType = 'small';
    } else if (numericPrice >= 200001 && numericPrice <= 400000) {
      carType = 'medium';
    } else {
      carType = 'large';
    }

    const carData = {
      name,
      price,
      image: imageUrl,
      carType,
    };

    const car = await prisma.car.create({
      data: carData,
    });

    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create car data' });
  }
};

const updateCar = async (req, res) => {
  const { id } = req.params;
  try {
    let car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const { name, price } = req.body;
    const numericPrice = parseFloat(price);
    let carType;

    if (numericPrice <= 200000) {
      carType = 'small';
    } else if (numericPrice <= 400000) {
      carType = 'medium';
    } else {
      carType = 'large';
    }

    let updatedCarData = {
      name,
      price,
      carType,
    };

    if (req.file || !req.body.image) {
      // Jika ada file yang diupload atau req body image kosong, update image
      const image = req.file ? req.file.filename : car.image;
      const imageUrl = req.file ? `http://localhost:${PORT}/uploads/${image}` : car.image;
      updatedCarData.image = imageUrl;
    }

    car = await prisma.car.update({
      where: { id: parseInt(id) },
      data: updatedCarData,
    });

    res.status(200).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update car data' });
  }
};


const deleteCar = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    if (car.image) {
      const filename = car.image.split('/').pop();
      const filePath = path.join(process.cwd(), 'public/uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.car.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete car data' });
  }
};


const getAllCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data mobil' });
  }
};

const getCarsByType = async (req, res) => {
  const { type } = req.params;

  try {
    const cars = await prisma.car.findMany({
      where: {
        carType: type,
      },
    });

    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data mobil berdasarkan tipe' });
  }
};

const getCarById = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });
    if (!car) {
      return res.status(404).json({ error: 'Mobil tidak ditemukan' });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data mobil' });
  }
};

export {
  getAllCars,
  getCarsByType,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};
