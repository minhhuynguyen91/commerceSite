var mongo = require('mongodb');
const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Category = mongoose.model('Category');


exports.index = function(req, res) {
  res.render('homes/index')

}


exports.id = function(req, res) {

}

exports.new = function(req, res) {
  const product = {};
  Category.find()
    .then((categories) => {
        res.render('products/new', {
        session : req.session,
        action : "/products",
        categories,
        product
      })

    })

    .catch((err) => {
      console.log(err);
      res.send('cannot get the categories');
    })

}

exports.post = function(req, res) {
  // 1/ push the product Id to the category
  // 2/ update the categoryId
  Category.findOne({'name' : req.body.categoryName})
    .then((category) => {
      const product = new Product
        ({
          title : req.body.title,
          content: req.body.content,
          img_link: req.body.img_link,
          quantity: req.body.quantity,
          note: req.body.note,
          displayOrder: (req.body.displayOrder) ? req.body.displayOrder : 999,
          frontPage: (req.body.frontPage == "on") ? true : false,
          categoryId : category._id
        });

      product.save()
        .then((product) => {
          category.updateOne({
            $push : {productIds: product._id}
          })
            .then(() => {
              res.redirect('/')
            })

            .catch((err) => {
              console.log(err);
              res.send('Cannot update the category')
            })
          
        })

        .catch((err) => {
          console.log(err);
          res.send('Cannot create the product');
        });

    })

    .catch((err) => {
      console.log(err);
      res.send('Cannot find the category')
    });


}

exports.edit = function(req, res) {
  var objectId = mongo.ObjectId(req.params.id)
  Category.find()
    .then((categories) => {
      Product.findOne({'_id' : objectId})
      .then((product) => {
        res.render('products/edit', {
          session : req.session,
          action : "/products/" + objectId + '?_method=put',
          categories,
          product
        })
      })

      .catch((err) => {
        console.log(err);
        res.send('Cannot get the product')
      });
    })

    .catch((err) => {
      console.log(err);
      res.send('Cannot get the categories')
    })

}

exports.put = function(req, res) {
  // 1 - Remove the productIds then update it with the current category 
  // 2 - Update the category ID from product
  var objectId = mongo.ObjectId(req.params.id)
  Product.findOne({'_id' : objectId})
    .then((product) => {
      Category.findOne({'_id' : product.categoryId })
        .then((oldCat) => {
          oldCat.updateOne({ $pull : { productIds: objectId } })
          .then(() => {
            Category.findOne({ 'name' : req.body.categoryName })
              .then((newCat) => {
                newCat.updateOne({ $push : {productIds: objectId} })
                  .then(() => {
                    product.updateOne({
                    title : req.body.title,
                    content: req.body.content,
                    img_link: req.body.img_link,
                    quantity: req.body.quantity,
                    note: req.body.note,
                    displayOrder: (req.body.displayOrder) ? req.body.displayOrder : 999,
                    frontPage: (req.body.frontPage == "on") ? true : false,
                    categoryId : newCat._id
                  })
                    .then(() => {
                      res.redirect('/')
                    })

                    .catch((err) => {
                      console.log(err);
                      res.send('Cannot update the product')
                    });
                  })

                  .catch((err) => {
                    console.log(err);
                    res.send('Cannot update the new category')
                  })
              })

              .catch((err) => {
                console.log(err);
                res.send('Cannot find the new category');
              });
          })
        })

        .catch((err) => {
          console.log(err);
          res.send('Cannot remove the old category');
        });
    })

    .catch((err) => {
      console.log(err);
      res.send('Cannot find the product');
    });
}

exports.delete = function(req, res) {

}