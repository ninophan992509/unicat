const categoryModel = require('../models/category.model');

const fieldModel = require('../models/field.model');

module.exports = async function(req, res, next) {
      const rows = await categoryModel.all();
      rows.forEach( async row => {
          row.Fields = await fieldModel.allFieldOfCategory(row); 
      });
      res.locals.lcCategories = rows;
      next();
}