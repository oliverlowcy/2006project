const Joi = require("joi");


 const foodPostSchema = Joi.object({
    foodpost: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        rating: Joi.number().required().min(0).max(5)
    }).required(),
    deletedImages: Joi.array()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required()
    }).required()
})

module.exports = {foodPostSchema,reviewSchema}

