const { MIME_TYPE_EPUB } = require("../utils/constant");

class Book {
  constructor(file, data) {
    // 如果是file就是新上传的电子书，解析电子书
    // 如果是data就是希望更新与插入电子书
    if (file) {
      this.createBookFromFile(file);
    } else {
      this.createBookFromData(data);
    }
  }
  createBookFromFile(file) {
    console.log("createBookFromFile", file);
    const { destination, filename, mimetype = MIME_TYPE_EPUB, path } = file;

    const suffix = mimetype === MIME_TYPE_EPUB ? ".epub" : "";

    const olbBookPath = path;

    const bookPath = `${destination}/${filename}.${suffix}`;
  }
  createBookFromData(data) {
    console.log("createBookFromData", data);
  }
}
module.exports = Book;
