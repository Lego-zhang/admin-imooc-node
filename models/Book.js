const {
  MIME_TYPE_EPUB,
  UPLOAD_URL,
  UPLOAD_PATH
} = require("../utils/constant");

const fs = require("fs");

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

    const {
      destination,
      filename,
      mimetype = MIME_TYPE_EPUB,
      path,
      originalname
    } = file;
    // 电子书的文件后缀名
    const suffix = mimetype === MIME_TYPE_EPUB ? "epub" : "";
    // 电子书的原有路劲
    const olbBookPath = path;
    // 电子书的新路径
    const bookPath = `${destination}/${filename}.${suffix}`;
    // 电子书的下载URL链接
    const url = `${UPLOAD_URL}/book/${filename}.${suffix}`;
    // 电子书解压后的文件夹路径
    const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`;
    // 电子书解压后的文件夹URL
    const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`;

    if (!fs.existsSync(unzipPath)) {
      fs.mkdirSync(unzipPath, { recursive: true });
    }
    // 更改文件名称
    if (fs.existsSync(olbBookPath) && !fs.existsSync(bookPath)) {
      fs.renameSync(olbBookPath, bookPath);
    }
    // 文件名
    this.filename = filename;
    // epub文件相对路径
    this.path = `/book/${filename}${suffix}`;
    // epub解压后相对路径
    this.filePath = this.path;

    this.url = url;
    // epub文件下载链接
    this.unzipPath = `/unzip/${filename}`;
    // 书名
    this.title = "";
    // 作者
    this.author = "";
    // 出版社
    this.publisher = "";
    // 目录
    this.contents = [];
    // 封面图片URL
    this.cover = "";
    // 分类ID
    this.category = -1;
    // 分类名称
    this.categoryText = "";
    // 语种
    this.language = "";
    // 解压后文件夹链接
    this.unzipPath = unzipPath;
    this.originalname = originalname;
  }
  createBookFromData(data) {
    console.log("createBookFromData", data);
  }
}
module.exports = Book;
