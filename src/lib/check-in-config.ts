export type CheckInFormValues = {
  challengeId: string;
  imageUrl: string;
  caption: string;
  checkInDate: string;
};

export function getInitialCheckInValues(challengeId = ""): CheckInFormValues {
  const today = new Date();
  const isoDate = today.toISOString().slice(0, 10);

  return {
    challengeId,
    imageUrl: "",
    caption: "",
    checkInDate: isoDate,
  };
}
