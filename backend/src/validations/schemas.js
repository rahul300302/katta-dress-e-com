import Joi from 'joi';

export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  size: Joi.string().valid('S', 'M', 'L', 'XL', 'XXL', 'XXXL').required(),
  quantity: Joi.number().integer().min(1).max(20).default(1),
});

export const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(20).required(),
});

const addressExtras = {
  label: Joi.string().valid('Home', 'Office', 'Other').allow('').optional(),
  flatHouse: Joi.string().max(120).allow('').optional(),
  area: Joi.string().max(120).allow('').optional(),
  landmark: Joi.string().max(120).allow('').optional(),
  alternatePhone: Joi.string().pattern(/^[6-9]\d{9}$/).allow('').optional(),
  deliveryInstructions: Joi.string().max(300).allow('').optional(),
  preferredSize: Joi.string().valid('S', 'M', 'L', 'XL', 'XXL', 'XXXL').allow('').optional(),
};

export const addressSchema = Joi.object({
  name: Joi.string().min(2).required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  email: Joi.string().email().required(),
  street: Joi.string().min(5).required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  ...addressExtras,
});

export const productSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow(''),
  images: Joi.array().items(Joi.string().uri()),
  productUploadImages: Joi.array().items(Joi.string().uri()),
  colorBasedImages: Joi.array().items(Joi.string().uri()),
  price: Joi.number().min(0).required(),
  offerPrice: Joi.number().min(0).allow(null),
  category: Joi.string().default('T-Shirt'),
  collection: Joi.string().default('Essentials'),
  sizes: Joi.array()
    .items(Joi.string().valid('S', 'M', 'L', 'XL', 'XXL', 'XXXL'))
    .min(1)
    .required(),
  colors: Joi.array().items(Joi.string()),
  colorVariants: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).required(),
      image: Joi.string().uri().required(),
    })
  ),
  sizeStock: Joi.object(),
  stock: Joi.number().integer().min(0).default(0),
  isHotSale: Joi.boolean(),
  isOffer: Joi.boolean(),
  isNewArrival: Joi.boolean(),
  isBestSeller: Joi.boolean(),
});

export const feedbackSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().allow('', null).optional(),
  message: Joi.string().min(10).max(2000).required(),
});

export const paymentVerifySchema = Joi.object({
  orderId: Joi.string().required(),
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join(', '),
      });
    }
    req.body = value;
    next();
  };
}
