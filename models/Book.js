const {
  MIME_TYPE_EPUB,
  UPLOAD_URL,
  UPLOAD_PATH
} = require("../utils/constant");

const fs = require("fs");

const path = require("path");

const Epub = require("../utils/epub");

const xml2js = require("xml2js").parseString;

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
    const {
      destination,
      filename,
      mimetype = MIME_TYPE_EPUB,
      path,
      originalname
    } = file;
    // 电子书的文件后缀名
    const suffix = mimetype === MIME_TYPE_EPUB ? ".epub" : "";
    // 电子书的原有路劲
    const olbBookPath = path;
    // 电子书的新路径
    const bookPath = `${destination}/${filename}${suffix}`;
    // 电子书的下载URL链接
    const url = `${UPLOAD_URL}/book/${filename}${suffix}`;
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
    // 树状嵌套目录
    this.contentsTree = [];
    // 封面图片URL
    this.cover = "";
    // 封面图片路径
    this.coverPath = "";
    // 分类ID
    this.category = -1;
    // 分类名称
    this.categoryText = "";
    // 语种
    this.language = "";
    // 解压后文件夹链接
    this.unzipPath = unzipPath;
    this.originalName = originalname;
  }
  createBookFromData(data) {}

  parse() {
    return new Promise((resolve, reject) => {
      const bookPath = `${UPLOAD_PATH}${this.filePath}`;
      if (!fs.existsSync(bookPath)) {
        reject(new Error("电子书不存在"));
      }
      const epub = new Epub(bookPath);
      epub.on("error", err => {
        reject(err);
      });
      epub.on("end", err => {
        if (err) {
          reject(err);
        } else {
          const {
            language,
            creator,
            creatorFileAs,
            title,
            cover,
            publisher
          } = epub.metadata;
          if (!title) {
            reject(new Error("图书标题为空"));
          } else {
            this.title = title;
            this.language = language || "en";
            this.author = creator || creatorFileAs || "unknown";
            this.publisher = publisher || "unknown";
            this.rootFile = epub.rootFile;

            const handleGetImage = (err, imgBuffer, mimeType) => {
              if (err) {
                reject(err);
              } else {
                const suffix = mimeType.split("/")[1];

                const coverPath = `${UPLOAD_PATH}/img/${this.filename}.${suffix}`;

                const coverUrl = `${UPLOAD_URL}/img/${this.filename}.${suffix}`;

                fs.writeFileSync(coverPath, imgBuffer, "binary");
                this.coverPath = coverPath;

                this.cover = coverUrl;

                resolve(this);
              }
            };

            try {
              this.unzip();
              this.parseContents(epub).then(({ chapters, chaptersTree }) => {
                this.contents = chapters;
                this.contentsTree = chaptersTree;
                epub.getImage(cover, handleGetImage);
              });
            } catch (e) {
              reject(e);
            }
          }
        }
      });
      epub.parse();
      this.epub = epub;
    });
  }

  unzip() {
    const AdmZip = require("adm-zip");
    const zip = new AdmZip(Book.genPath(this.path));
    zip.extractAllTo(this.unzipPath, true);
  }

  parseContents(epub) {
    function getNcxFilePath() {
      const spine = epub && epub.spine;
      const manifest = epub && epub.manifest;
      const ncx = spine.toc && spine.toc.href;
      const id = spine.toc && spine.toc.id;

      if (ncx) {
        return ncx;
      } else {
        return manifest[id].href;
      }
    }

    function findParent(array, level = 0, pid = "") {
      return array.map(item => {
        item.level = level;
        item.pid = pid;
        if (item.navPoint && item.navPoint.length > 0) {
          item.navPoint = findParent(item.navPoint, level + 1, item["$"].id);
        } else if (item.navPoint) {
          item.navPoint.level = level + 1;
          item.navPoint.pid = item["$"].id;
        }

        return item;
      });
    }

    function flatten(array) {
      return [].concat(
        ...array.map(item => {
          if (item.navPoint && item.navPoint.length > 0) {
            return [].concat(item, ...flatten(item.navPoint));
          } else if (item.navPoint) {
            return [].concat(item, item.navPoint);
          }
          return item;
        })
      );
    }

    const ncxFilePath = `${this.unzipPath}/${getNcxFilePath()}`;

    if (fs.existsSync(ncxFilePath)) {
      return new Promise((resolve, reject) => {
        const xml = fs.readFileSync(ncxFilePath, "utf-8");
        const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH, "");
        console.log("dir", dir);
        const filename = this.filename;
        xml2js(
          xml,
          {
            explicitArray: false,
            ignoreAttrs: false
          },
          (err, json) => {
            if (err) {
              reject(err);
            } else {
              const navMap = json.ncx.navMap;

              if (navMap.navPoint && navMap.navPoint.length > 0) {
                navMap.navPoint = findParent(navMap.navPoint);
                const newNavMap = flatten(navMap.navPoint);

                const chapters = [];

                // console.log("nav", newNavMap[0].content["$"]);
                // console.log("nav", newNavMap.length, epub.flow.length);
                newNavMap.forEach((chapter, index) => {
                  const src = chapter.content["$"].src;

                  const nav = newNavMap[index];
                  chapter.text = `${UPLOAD_URL}${dir}/${src}`;

                  chapter.label = chapter.navLabel.text || "";

                  chapter.navId = chapter["$"].id;
                  chapter.fileName = filename;
                  chapter.order = index + 1;
                  chapters.push(chapter);
                });
                const chaptersTree = [];
                chapters.forEach(c => {
                  c.children = [];
                  if (c.pid === "") {
                    chaptersTree.push(c);
                  } else {
                    const parent = chapters.find(_ => _.navId === c.pid);
                    parent.children.push(c);
                  }
                });
                resolve({ chapters, chaptersTree });
              } else {
                reject(new Error("目录解析失败，目录数为0"));
              }
            }
          }
        );
      });
    } else {
      throw new Error("目录文件不存在");
    }
  }

  static genPath(path) {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    return `${UPLOAD_PATH}${path}`;
  }
}
module.exports = Book;
