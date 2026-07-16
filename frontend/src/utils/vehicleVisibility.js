export function getVehicleVisibility(user) {
  const vehicleClass = user?.vehicleClass;
  const vehicleUsage = user?.vehicleUsage;
  const transportType = user?.transportType;

  const isTwoWheeler = vehicleClass === '2 Wheeler';
  const isThreeWheeler = vehicleClass === '3 Wheeler';
  const isFourWheeler = vehicleClass === '4 Wheeler';
  const isOtherVehicle = vehicleClass === 'Other Vehicles';

  const isGoodsCarrier = transportType === 'Goods Carrier';
  const isPassengerTransport = transportType === 'Passenger';

  const isNonCommercial =
    vehicleUsage === 'Non Commercial';

  /* ========================================
     FASTAG VISIBILITY
     Existing logic unchanged
  ======================================== */

  const hideFASTag =
    isTwoWheeler ||
    isOtherVehicle ||
    isThreeWheeler;

  /* ========================================
     TOLL PAYMENT VISIBILITY
     Existing logic unchanged
  ======================================== */

  const hideTollPayments =
    isTwoWheeler ||
    isOtherVehicle;

  /* ========================================
     LOGISTICS VISIBILITY

     Logistics is an ADDITIONAL feature
     available only for Goods Carrier vehicles.
  ======================================== */

  const hideLogisticsModule = !isGoodsCarrier;

  /* ========================================
     SHIPMENT LOAD BOARD
     Existing logic unchanged
  ======================================== */

  const hideShipmentLoadBoard =
    isTwoWheeler ||
    isOtherVehicle ||
    (isThreeWheeler && isPassengerTransport) ||
    isFourWheeler;

  /* ========================================
     TRANSPORT PERMIT
     Existing logic unchanged
  ======================================== */

  const hideTransportPermit = isTwoWheeler;

  /* ========================================
     PASSENGER PERMIT
     Existing logic unchanged
  ======================================== */

  const hidePassengerPermit =
    isGoodsCarrier ||
    isNonCommercial;

  return {
    showFASTag: !hideFASTag,
    showTollPayments: !hideTollPayments,

    showLogistics: !hideLogisticsModule,

    showShipmentLoadBoard: !hideShipmentLoadBoard,
    showTransportPermit: !hideTransportPermit,
    showPassengerPermit: !hidePassengerPermit,
  };
}