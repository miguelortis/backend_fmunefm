const { httpError } = require('../helpers/handleError')
const User = require('../models/user')

//get all sinisters!
const getSinisters = async (req, res) => {
  try {
    const { skip, type, limit } = req.query
    const ITS = await User.find().count()
    const ITP = await User.find().count()
    const ITT = await User.find().count()
    if (type === 'SH') {
      const sinisterHistory = await User.find().skip(skip).limit(limit).sort({ $natural: -1 })
      res.json({
        status: 200,
        SH: { history: sinisterHistory, IT: ITS },
        PH: { history: [], IT: ITP },
        TH: { history: [], IT: ITT },
      })
    } else if (type === 'PH') {
      const paymentHistory = await User.find().skip(skip).limit(limit).sort({ $natural: -1 })
      res.json({
        status: 200,
        PH: { history: paymentHistory, IT: ITP },
        SH: { history: [], IT: ITS },
        TH: { history: [], IT: ITT },
      })
    } else if (type === 'TH') {
      const TH = await User.find().skip(skip).limit(limit).sort({ $natural: -1 })
      res.json({
        status: 200,
        TH: { history: TH, IT: ITT },
        SH: { history: [], IT: ITS },
        PH: { history: [], IT: ITP },
      })
    } else if (type === 'ALL') {
      const SH = await User.find().skip(skip).limit(limit).sort({ $natural: -1 })
      const PH = await User.find().skip(skip).limit(limit).sort({ $natural: -1 })
      const TH = await User.find().skip(skip).limit(limit).sort({ $natural: -1 })
      res.json({
        status: 200,
        SH: { history: SH, IT: ITS },
        PH: { history: PH, IT: ITP },
        TH: { history: TH, IT: ITT },
      })
    }
  } catch (error) {
    return res.status(400).json({ message: 'no autorizado' })
  }
}

module.exports = { getSinisters }
