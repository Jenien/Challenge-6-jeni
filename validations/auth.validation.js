import joi from 'joi';

const createSchema = joi.object({
  name: joi.string().max(50).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
});

const createSchemaSuper = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
});

export { createSchema, loginSchema,createSchemaSuper };
