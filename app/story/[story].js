export default async (req, res) => {
  try {
    return req.params;
  } catch (err) {
    return "fail";
  }
};
