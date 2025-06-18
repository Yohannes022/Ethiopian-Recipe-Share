import Category from '../models/category.model';
import { Request, Response } from 'express';
import { ICategory } from '../models/category.model';
import { StatusCodes } from 'http-status-codes';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;
    
    const category = new Category({
      name,
      description,
      image
    });

    await category.save();
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: null
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};
