import mongoose, { Document, Types } from 'mongoose';
import { IRestaurant } from './restaurant.model';
export interface IMenuItem extends Document {
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isSpicy: boolean;
    isAvailable: boolean;
    restaurant: Types.ObjectId | IRestaurant;
    createdAt: Date;
    updatedAt: Date;
}
declare const MenuItem: mongoose.Model<IMenuItem, {}, {}, {}, mongoose.Document<unknown, {}, IMenuItem, {}> & IMenuItem & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default MenuItem;
