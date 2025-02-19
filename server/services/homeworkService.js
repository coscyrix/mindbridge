import Homework from '../models/homework.js';

const homeworkModel = new Homework();

export default class HomeworkService {
  //////////////////////////////////////////
  async createHomework(data) {
    return await homeworkModel.postHomework(data);
  }
}
