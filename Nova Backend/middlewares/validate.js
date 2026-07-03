export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });
  if (!result.success) {
    const issues = result.error.issues || result.error.errors;
    const message = issues.map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  req.body = result.data.body ?? req.body;
  req.params = result.data.params ?? req.params;
  if (result.data.query) {
    Object.assign(req.query, result.data.query);
  }
  next();
};