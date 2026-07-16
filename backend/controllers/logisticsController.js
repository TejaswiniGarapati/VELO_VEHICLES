const Logistics = require('../models/Logistics');

exports.getDeliveries = async (req, res) => {
  try {
    if (req.user.transportType !== 'Goods Carrier') {
      return res.status(403).json({
        message:
          'Logistics is available only for Goods Carrier vehicles',
      });
    }

    const deliveries = await Logistics.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      deliveries,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to load logistics information',
    });
  }
};

exports.createDelivery = async (req, res) => {
  try {
    if (req.user.transportType !== 'Goods Carrier') {
      return res.status(403).json({
        message:
          'Logistics is available only for Goods Carrier vehicles',
      });
    }

    const delivery = await Logistics.create({
      user: req.user._id,
      goodsType: req.body.goodsType,
      pickupLocation: req.body.pickupLocation,
      destination: req.body.destination,
      goodsWeight: req.body.goodsWeight,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      transportCharge: req.body.transportCharge,
    });

    res.status(201).json({
      message: 'Transport job created successfully',
      delivery,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to create transport job',
    });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    if (req.user.transportType !== 'Goods Carrier') {
      return res.status(403).json({
        message:
          'Logistics is available only for Goods Carrier vehicles',
      });
    }

    const allowedStatuses = [
      'ASSIGNED',
      'PICKED UP',
      'IN TRANSIT',
      'DELIVERED',
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: 'Invalid delivery status',
      });
    }

    const delivery = await Logistics.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!delivery) {
      return res.status(404).json({
        message: 'Transport job not found',
      });
    }

    delivery.status = req.body.status;

    await delivery.save();

    res.json({
      message: 'Delivery status updated',
      delivery,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to update delivery status',
    });
  }
};