const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const categoryModel = require("../../models/category.model");
const fieldModel = require("../../models/field.model");
const teacherModel = require("../../models/teacher.model");
const multer = require("multer");
const path = require("path");
const deleteFile = require("../../service/delete");

router.get("/", auth, async function (req, res) {
  const categories = await categoryModel.allWithDetails();
  res.render("vwAdminPages/vwCat/index", {
    layout: "main-admin",
    title: "Categories",
    categories,
    mg_cat: 1,
  });
});

router.get("/new-cat", auth, async function (req, res) {
  res.render("vwAdminPages/vwCat/new-cat", {
    layout: "main-admin",
    title: "New Categories",
    mg_cat: 1,
  });
});

router.get("/new-sub-cat", auth, async function (req, res) {
  const categories = await categoryModel.all();
  res.render("vwAdminPages/vwCat/new-sub-cat", {
    layout: "main-admin",
    title: "New Categories",
    categories,
    mg_cat: 1,
  });
});

router.get("/sub-cat", auth, async function (req, res) {
  const fields = await fieldModel.allWithDetails();
  res.render("vwAdminPages/vwCat/sub-cat", {
    layout: "main-admin",
    title: "New Categories",
    fields,
    mg_cat: 1,
  });
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/images/categories/";
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

router.post(
  "/new-cat",
  auth,
  multer({ storage }).any(),
  async function (req, res) {
    try {
      const new_cat = {
        CatName: req.body.cat_name,
        CatImg: req.files[0].filename,
      };

      await categoryModel.add(new_cat);
      res.redirect("/admin/manage-categories/");
    } catch (error) {
      throw error;
    }
  }
);

router.post("/new-sub-cat", auth, async function (req, res) {
  try {
    const new_field = {
      CatID: +req.body.cat_id,
      FldName: req.body.field_name,
    };
    await fieldModel.add(new_field);
    res.redirect("/admin/manage-categories/sub-cat");
  } catch (error) {
    throw error;
  }
});

router.post("/edit-cat", auth, async function (req, res) {
  try {
    const cat = await categoryModel.single(+req.body.id);
    res.render("vwAdminPages/vwCat/new-cat", {
      cat,
      layout: "main-admin",
      title: "Chỉnh sửa danh mục",
    });
  } catch (error) {
    throw error;
  }
});

router.post("/edit-fld", auth, async function (req, res) {
  try {
    const fld = await fieldModel.single(+req.body.id);
    const categories = await categoryModel.all();
    res.render("vwAdminPages/vwCat/new-sub-cat", {
      fld,
      categories,
      layout: "main-admin",
      title: "Chỉnh sửa danh mục",
      mg_cat: 1,
    });
  } catch (error) {
    throw error;
  }
});

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/images/categories/";
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

router.post(
  "/edit-cat-done",
  auth,
  multer({ storage }).any(),
  async function (req, res) {
    try {
      const cat = await categoryModel.single(+req.body.id);
      const new_cat = {
        CatName: req.body.cat_name,
        CatID: +req.body.id,
      };

      if (req.files.length > 0) {
        new_cat.CatImg = req.files[0].filename;
        deleteFile("./public/images/categories/" + cat.CatImg);
      }
      await categoryModel.patch(new_cat);

      res.redirect("/admin/manage-categories/");
    } catch (error) {
      throw error;
    }
  }
);

router.post("/edit-subcat-done", auth, async function (req, res) {
  try {
    const new_field = {
      CatID: +req.body.cat_id,
      FldName: req.body.field_name,
      FldID: +req.body.id,
    };
    await fieldModel.patch(new_field);
    res.redirect("/admin/manage-categories/sub-cat");
  } catch (error) {
    throw error;
  }
});

router.post("/del-cat", auth, async function (req, res) {
  try {
    const id = +req.body.id;
    const entity = await categoryModel.single(id);
    await fieldModel.delByCatID(entity);
    deleteFile(`./public/images/categories/${entity.CatImg}`);
    await categoryModel.del(entity);
    res.redirect("/admin/manage-categories/");
  } catch (error) {
    throw error;
  }
});

router.post("/del-subcat", auth, async function (req, res) {
  try {
    const id = +req.body.id;
    const entity = { FldID: id };
    await fieldModel.del(entity);
    res.redirect("/admin/manage-categories/sub-cat");
  } catch (error) {
    throw error;
  }
});

module.exports = router;
