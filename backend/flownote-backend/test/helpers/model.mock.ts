export type MockModel = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  countDocuments: jest.Mock;
  insertMany: jest.Mock;
  findOneAndUpdate: jest.Mock;
};

export function createMockModel(): MockModel {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
}
