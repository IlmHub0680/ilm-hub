import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, dob, nationality, countryOfResidence, programId, studySession } = body;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    let category = 'Mature Learner';
    let feeGHS = 150;
    let feeUSD = 50;

    if (age >= 4 && age <= 14) {
      category = 'Junior Learner';
      feeGHS = 50;
      feeUSD = 20;
    } else if (age >= 15 && age <= 20) {
      category = 'Senior Learner';
      feeGHS = 100;
      feeUSD = 35;
    }

    let amountToPay = feeGHS;
    let currency = 'GHS';

    if (nationality !== 'Ghana' && countryOfResidence !== 'Ghana') {
      const africanCountries = ['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Morocco', 'Ivory Coast', 'Senegal'];
      if (africanCountries.includes(countryOfResidence)) {
        currency = countryOfResidence === 'Nigeria' ? 'NGN' : 'GHS-Equivalent';
        amountToPay = feeGHS;
      } else {
        currency = 'USD';
        amountToPay = feeUSD;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        learnerCategory: category,
        age,
        currency,
        admissionFee: amountToPay,
        studySession,
        status: 'Pending Payment'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
