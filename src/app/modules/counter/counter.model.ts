import { Schema, model } from "mongoose";
import { counter } from "./counter.interface.js";


const CounterSchema = new Schema<counter>({
   combineyearAndCode: { type: String, required: true, unique: true },
    sequenceValue: { 
        type: Number, 
        required: true ,
        default: 0
    }
})

const CounterModel = model<counter>('Counter', CounterSchema)

export default CounterModel