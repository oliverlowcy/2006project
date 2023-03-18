function catchAsyncWrapper(myfunc){
    return function (req, res, next) {
        myfunc(req, res, next).catch(next)
    }

}


module.exports = catchAsyncWrapper;