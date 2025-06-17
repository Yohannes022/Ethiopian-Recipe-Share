import mongoose, { Document } from 'mongoose';
export interface IMenuItem {
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isSpicy?: boolean;
    isAvailable: boolean;
}
export interface IRestaurant extends Document {
    name: string;
    description: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        coordinates?: [number, number];
    };
    phone: string;
    email: string;
    website?: string;
    cuisineType: string[];
    openingHours: {
        monday: {
            open: boolean;
            hours: {
                open: string;
                close: string;
            };
        };
        tuesday: {
            open: boolean;
            hours: {
                open: string;
                close: string;
            };
        };
        wednesday: {
            open: boolean;
            hours: {
                open: string;
                close: string;
            };
        };
        thursday: {
            open: boolean;
            hours: {
                open: string;
                close: string;
            };
        };
        friday: {
            open: boolean;
            hours: {
                open: string;
                close: string;
            };
        };
        saturday: {
            open: boolean;
            hours: {
                open: string;
                close: string;
            };
        };
        sunday: {
            open: boolean;
            hours: {
                open: string;
                close: string;
            };
        };
    };
    menu: IMenuItem[];
    owner: mongoose.Types.ObjectId;
    images: string[];
    rating: {
        average: number;
        count: number;
    };
    isActive: boolean;
    isFeatured: boolean;
    deliveryOptions: {
        delivery: boolean;
        pickup: boolean;
        minimumOrder: number;
        deliveryFee: number;
        freeDeliveryOver: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const Restaurant: mongoose.Model<IRestaurant, {}, {}, {}, mongoose.Document<unknown, {}, IRestaurant, {}> & IRestaurant & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Restaurant;
