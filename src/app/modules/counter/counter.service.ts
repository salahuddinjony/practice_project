import CounterModel from './counter.model.js'

const createCounterIntoDB = async (id: String) => {
    const counterData = await CounterModel.findOneAndUpdate(
        { combineyearAndCode: id },
        { $inc: { sequenceValue: 1 } },
        { returnDocument: 'after', upsert: true }, //here upsert: true will create a new document if it doesn't exist, and returnDocument: 'after' will return the updated document after the increment operation is performed

    )
    return counterData;
}
export const CounterService = {
    createOrFindCounterIntoDB: createCounterIntoDB
}