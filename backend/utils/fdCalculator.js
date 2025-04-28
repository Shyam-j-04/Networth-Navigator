const calculateFDValue = (principal, interestRate, startDate, durationInYears) => {
  if (!principal || !interestRate || !startDate || !durationInYears) {
      return 0;
  }

  const start = new Date(startDate);
  const today = new Date();

  // If start date is in the future, return only the principal
  if (start > today) {
      return principal;
  }

  const elapsedYears = (today - start) / (1000 * 60 * 60 * 24 * 365.25);
  const r = interestRate / 100;
  const compoundingFrequency = 4; // Quarterly compounding

  // Calculate total duration value
  const totalAmount = principal * Math.pow((1 + r / compoundingFrequency), compoundingFrequency * durationInYears);

  // If FD is matured, return final amount, otherwise return accumulated amount till now
  const currentValue = elapsedYears >= durationInYears
      ? totalAmount
      : principal * Math.pow((1 + r / compoundingFrequency), compoundingFrequency * elapsedYears);

  return parseFloat(currentValue.toFixed(2));
};

module.exports = { calculateFDValue };

  