import mongoose, { Mongoose } from 'mongoose';
declare global {
    var mongoose: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
}
export declare const connectDB: () => Promise<Mongoose>;
export default mongoose;
