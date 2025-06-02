const HManager = artifacts.require("HManager");

contract("HManager", (accounts) => {
  let hManagerInstance;
  const owner = accounts[0];
  const doctor1 = accounts[1];
  const patient1 = accounts[2];
  const patient1Name = "Alice Wonderland";

  before(async () => {
    hManagerInstance = await HManager.deployed();
  });

  it("should deploy the HManager contract", async () => {
    assert.ok(hManagerInstance.address, "Contract address should not be empty");
    assert.notEqual(hManagerInstance.address, "0x0000000000000000000000000000000000000000", "Contract address should not be the zero address");
  });

  it("should allow an account to be added as a doctor", async () => {
    await hManagerInstance.addDoctor({ from: doctor1 });
    const isDoctor = await hManagerInstance.doctors(doctor1);
    assert.isTrue(isDoctor, "Account should be registered as a doctor");
  });

  it("should allow a doctor to add a new patient", async () => {
    await hManagerInstance.addPatient(patient1, patient1Name, { from: doctor1 });
    const patientData = await hManagerInstance.patients(patient1);
    assert.equal(patientData.id, patient1, "Patient ID should match");
    assert.equal(patientData.name, patient1Name, "Patient name should match");

    // Verify patient is in the list
    const patientList = await hManagerInstance.getAllPatientsInfo({ from: doctor1 });
    const foundPatient = patientList.find(p => p.id === patient1);
    assert.ok(foundPatient, "Patient should be in the all patients list");
    assert.equal(foundPatient.name, patient1Name, "Patient name in list should match");
  });

  it("should allow a doctor to add a record for a patient and retrieve it", async () => {
    const cid = "QmTestCID123";
    const fileName = "report.pdf";
    const diagnosis = "Flu";
    const treatment = "Rest and fluids";

    await hManagerInstance.addPatientRecord(
      cid,
      fileName,
      patient1Name, // Assuming patient name is known, contract uses it for the Record struct
      patient1,
      diagnosis,
      treatment,
      { from: doctor1 }
    );

    const records = await hManagerInstance.getPatientRecords(patient1, { from: doctor1 });
    assert.isNotEmpty(records, "Patient records should not be empty");
    assert.equal(records.length, 1, "Should have one record for the patient");

    const record = records[0];
    assert.equal(record.cid, cid, "Record CID should match");
    assert.equal(record.fileName, fileName, "Record file name should match");
    assert.equal(record.patientName, patient1Name, "Record patient name should match");
    assert.equal(record.patientId, patient1, "Record patient ID should match");
    assert.equal(record.diagnosis, diagnosis, "Record diagnosis should match");
    assert.equal(record.treatment, treatment, "Record treatment should match");
    assert.equal(record.doctorId, doctor1, "Record doctor ID should match");
  });

});

