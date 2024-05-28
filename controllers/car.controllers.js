import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import {prisma} from '../libs/prisma.js';
// import multer from '../libs/multer.mjs'; // Uncomment this line if needed
// import {verifyToken}from '../middlewares/verifyToken.js';
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
    const createdBy = await prisma.user.findUnique({ where: { id: req.user.id } });
    const updatedBy = createdBy;

    const carData = {
      name,
      price,
      image: imageUrl,
      carType,
      createdBy:createdBy.name,
      updatedBy:updatedBy.name,
    };

    const car = await prisma.car.create({
      data: carData,
    });

    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal Membuat Data Mobil' });
  }
};

const updateCar = async (req, res) => {
  const { id } = req.params;
  try {
    let car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });

    if (!car || car.isDeleted) {
      return res.status(404).json({ error: 'Data Mobil tidak ditemukan' });
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
    const updatedBy = await prisma.user.findUnique({ where: { id: req.user.id } });

    let updatedCarData = {
      name,
      price,
      carType,
      updatedBy: updatedBy.name,
    };

    if (req.file || !req.body.image) {
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
    res.status(500).json({ error: 'Gagal mengupdate data mobil' });
  }
};


const deleteCar = async (req, res) => {
  const { id } = req.params;
  try {
    let car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });

    if (!car) {
      return res.status(404).json({ error: 'Data Mobil tidak ditemukan' });
    }

    if (car.image) {
      const filename = car.image.split('/').pop();
      const filePath = path.join(process.cwd(), 'public/uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const deletedBy = await prisma.user.findUnique({ where: { id: req.user.id } });

    car = await prisma.car.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
        deletedBy: deletedBy.name,
      },
    });

    res.status(200).json({ message: 'Mobil sudah di hapus, berhasil menambahkan isDeleted' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
};



const getAvailCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: { isDeleted: false },
    });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Gagal Menampilkankan Data mobil' });
  }
};

//all car
const getAllCars = async (req,res)=> {
  try {
    const cars = await prisma.car.findMany(); 
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve car data' });
  }
};

const getCarsByType = async (req, res) => {
  const { type } = req.params;
  try {
    console.log('Received type:', type);
    if (!['small', 'medium', 'large'].includes(type)) {
      return res.status(400).json({ error: 'Invalid car type' });
    }

    const cars = await prisma.car.findMany({
      where: {
        carType: type,
        isDeleted: false,
      },
    });
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars by type:', error);
    res.status(500).json({ error: 'Gagal menampilkan data mobil berdasarkan tipe' });
  }
};
const getCarById = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });
    if (!car) {
      return res.status(404).json({ error: 'Car data not found' });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch car data' });
  }
};

export {
  getAvailCars,
  getAllCars,
  getCarsByType,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};
