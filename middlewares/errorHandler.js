const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if(err.status){
    res.status(err.status).json({ message:err.message});
    return;
  }
  res.status(500).json({ message:err.message});
}

export default errorHandler;