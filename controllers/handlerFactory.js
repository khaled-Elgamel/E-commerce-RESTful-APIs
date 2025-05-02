const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ApiError('No doc found for this id', 404));
    }

    res.status(204).send();
  });

exports.updateOne = Model =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new ApiError('No document found for this id', 404));
    }

    // Trigger the "save" event when the document is updated
    // await doc.save();

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = Model =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new ApiError('No doc found for this id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model, ModelName = ' ') =>
  asyncHandler(async (req, res, next) => {
    const count = await Model.countDocuments();
    //to allow for nested routes
    let filter = {};
    if (req.filterObj) filter = req.filterObj;
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(count)
      .filter()
      .sort()
      .search(ModelName)
      .limitFields();

    const { paginationResult, mongooseQuery } = apiFeatures;
    const documents = await mongooseQuery;
    res.status(200).json({
      status: 'success',
      results: documents.length,
      paginationResult,
      data: {
        documents,
      },
    });
  });
