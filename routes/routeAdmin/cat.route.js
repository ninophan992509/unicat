const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const categoryModel = require("../../models/category.model");
const fieldModel = require("../../models/field.model");
const multer = require("multer");
const path = require("path");

router.get("/", auth, async function (req, res) {
  const categories = await categoryModel.allWithDetails();
  res.render("vwAdminPages/vwCat/index", {
    layout: "main-admin",
    title: "Categories",
    categories,
  });
});

router.get("/new-cat", auth, async function (req, res) {
 
  res.render("vwAdminPages/vwCat/new-cat", {
    layout: "main-admin",
    title: "New Categories",
  });
});

router.get("/new-sub-cat", auth, async function (req, res) {
  const categories = await categoryModel.all();
  res.render("vwAdminPages/vwCat/new-sub-cat", {
    layout: "main-admin",
    title: "New Categories",
    categories,
  });
});

router.get("/sub-cat", auth, async function (req, res) {
  const fields = await fieldModel.allWithDetails();
  res.render("vwAdminPages/vwCat/sub-cat", {
    layout: "main-admin",
    title: "New Categories",
    fields,
  });
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/images/categories/";
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now()+path.extname(file.originalname));
  },
});

router.post("/new-cat", auth,multer({storage}).any(),async function (req, res) {
  if(req.body.length>0 && req.files)
  {
       const new_cat = {
           CatName: req.body.cat_name,
           CatImg: req.files[0].filename,
       }
       await categoryModel.add(new_cat);
  }

  res.redirect("/admin/manage-categories/");
});

router.post(
  "/new-sub-cat",
  auth,
  async function (req, res) {
    if (req.body.length > 0 ) {
      const new_field = {
        CatID: req.body.cat_id,
        FldName: req.body.field_name,
      };
      console.log(req.body);

      await fieldModel.add(new_field);
    }

    res.redirect("/admin/manage-categories/sub-cat");
  }
);

module.exports = router;
