
CREATE DATABASE pms;
USE pms;

-- ========================
-- 1. Pharmacy
-- ========================
CREATE TABLE Pharmacy (
PharmacyID INT PRIMARY KEY AUTO_INCREMENT,
Name VARCHAR(100) NOT NULL,
Location VARCHAR(150) NOT NULL,
ContactNumber VARCHAR(20) NOT NULL,
Email VARCHAR(100) NOT NULL,
UNIQUE (Name, Location),
UNIQUE (Email)
);

-- ========================
-- 2. Medicine
-- ========================
CREATE TABLE Medicine (
MedicineID INT PRIMARY KEY AUTO_INCREMENT,
PharmacyID INT NOT NULL,
Name VARCHAR(100) NOT NULL,
Category VARCHAR(50) NOT NULL,
Brand VARCHAR(50) NOT NULL,
UnitPrice DECIMAL(10,2) NOT NULL,
QuantityInStock INT NOT NULL,
ExpiryDate DATE NOT NULL,
ReorderLevel INT NOT NULL,
UNIQUE (PharmacyID, Name),
FOREIGN KEY (PharmacyID) REFERENCES Pharmacy(PharmacyID)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
);

-- ========================
-- 3. Supplier
-- ========================
CREATE TABLE Supplier (
SupplierID INT PRIMARY KEY AUTO_INCREMENT,
Name VARCHAR(100) NOT NULL,
ContactPerson VARCHAR(100) NOT NULL,
Phone VARCHAR(20) NOT NULL,
Email VARCHAR(100) NOT NULL,
Address VARCHAR(200) NOT NULL,
UNIQUE (Phone),
UNIQUE (Email)
);

-- ========================
-- 4. Supply (M–M Resolver)
-- ========================
CREATE TABLE Supply (
SupplyID INT PRIMARY KEY AUTO_INCREMENT,
SupplierID INT NOT NULL,
MedicineID INT NOT NULL,
SupplyDate DATE NOT NULL,
QuantitySupplied INT NOT NULL,
UnitCost DECIMAL(10,2) NOT NULL,
FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);

-- ========================
-- 5. Customer
-- ========================
CREATE TABLE Customer (
CustomerID INT PRIMARY KEY AUTO_INCREMENT,
FullName VARCHAR(100) NOT NULL,
Phone VARCHAR(20) NOT NULL,
Address VARCHAR(200) NOT NULL,
UNIQUE (Phone)
);

-- ========================
-- 6. Prescription
-- ========================
CREATE TABLE Prescription (
PrescriptionID INT PRIMARY KEY AUTO_INCREMENT,
CustomerID INT NOT NULL,
DoctorName VARCHAR(100) NOT NULL,
DateIssued DATE NOT NULL,
FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
);

-- ========================
-- 7. PrescriptionDetail (M–M Resolver)
-- ========================
CREATE TABLE PrescriptionDetail (
PrescriptionID INT NOT NULL,
MedicineID INT NOT NULL,
Dosage VARCHAR(50) NOT NULL,
Duration VARCHAR(50) NOT NULL,
Quantity INT NOT NULL,
PRIMARY KEY (PrescriptionID, MedicineID),
FOREIGN KEY (PrescriptionID) REFERENCES Prescription(PrescriptionID)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
);

-- ========================
-- 8. Sale
-- ========================
CREATE TABLE Sale (
SaleID INT PRIMARY KEY AUTO_INCREMENT,
CustomerID INT NOT NULL,
SaleDate DATE NOT NULL,
TotalAmount DECIMAL(10,2) NOT NULL,
FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
);

-- ========================
-- 9. SaleDetail (M–M Resolver)
-- ========================
CREATE TABLE SaleDetail (
SaleID INT NOT NULL,
MedicineID INT NOT NULL,
QuantitySold INT NOT NULL,
SellingPrice DECIMAL(10,2) NOT NULL,
PRIMARY KEY (SaleID, MedicineID),
FOREIGN KEY (SaleID) REFERENCES Sale(SaleID)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
);

-- ========================
-- 10. Employee
-- ========================
CREATE TABLE Employee (
EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
PharmacyID INT NOT NULL,
FullName VARCHAR(100) NOT NULL,
Role ENUM('Pharmacist', 'Cashier', 'Admin') NOT NULL,
Username VARCHAR(50) UNIQUE NOT NULL,
PasswordHash VARCHAR(255) NOT NULL,
FOREIGN KEY (PharmacyID) REFERENCES Pharmacy(PharmacyID)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
);



show create table employee;

-- ========================
-- Sample JOIN Queries
-- ========================

-- 1) List medicines with their pharmacy (INNER JOIN)
SELECT m.MedicineID, m.Name AS MedicineName, p.PharmacyID, p.Name AS PharmacyName
FROM Medicine m
INNER JOIN Pharmacy p ON m.PharmacyID = p.PharmacyID;

-- 2) Sales with customer names and total sale amount (JOIN + GROUP BY)
SELECT s.SaleID, c.FullName AS CustomerName, s.SaleDate,
       SUM(sd.QuantitySold * sd.SellingPrice) AS ComputedTotal
FROM Sale s
INNER JOIN Customer c ON s.CustomerID = c.CustomerID
INNER JOIN SaleDetail sd ON s.SaleID = sd.SaleID
GROUP BY s.SaleID, c.FullName, s.SaleDate;

-- 3) Detailed sale lines with medicine info (INNER JOIN)
SELECT s.SaleID, s.SaleDate, c.FullName AS CustomerName,
       m.MedicineID, m.Name AS MedicineName, sd.QuantitySold, sd.SellingPrice
FROM SaleDetail sd
INNER JOIN Sale s ON sd.SaleID = s.SaleID
INNER JOIN Customer c ON s.CustomerID = c.CustomerID
INNER JOIN Medicine m ON sd.MedicineID = m.MedicineID;

-- 4) Prescriptions with customer and medicine details (MULTI JOIN)
SELECT pr.PrescriptionID, pr.DateIssued, c.FullName AS CustomerName,
       m.MedicineID, m.Name AS MedicineName, pd.Dosage, pd.Duration, pd.Quantity
FROM Prescription pr
INNER JOIN Customer c ON pr.CustomerID = c.CustomerID
INNER JOIN PrescriptionDetail pd ON pr.PrescriptionID = pd.PrescriptionID
INNER JOIN Medicine m ON pd.MedicineID = m.MedicineID;

-- 5) Supplies: supplier, medicine, and unit cost (INNER JOIN)
SELECT sup.SupplyID, s.Name AS SupplierName, m.Name AS MedicineName,
       sup.SupplyDate, sup.QuantitySupplied, sup.UnitCost
FROM Supply sup
INNER JOIN Supplier s ON sup.SupplierID = s.SupplierID
INNER JOIN Medicine m ON sup.MedicineID = m.MedicineID;

-- 6) Employees and their pharmacy (INNER JOIN)
SELECT e.EmployeeID, e.FullName, e.Role, p.Name AS PharmacyName
FROM Employee e
INNER JOIN Pharmacy p ON e.PharmacyID = p.PharmacyID;

-- 7) Medicines that have never been sold (LEFT JOIN + anti-join pattern)
SELECT m.MedicineID, m.Name
FROM Medicine m
LEFT JOIN SaleDetail sd ON m.MedicineID = sd.MedicineID
WHERE sd.MedicineID IS NULL;

-- 8) Customers and their last sale date (LEFT JOIN + aggregation)
SELECT c.CustomerID, c.FullName, MAX(s.SaleDate) AS LastSaleDate
FROM Customer c
LEFT JOIN Sale s ON c.CustomerID = s.CustomerID
GROUP BY c.CustomerID, c.FullName;

-- ========================
-- Sample Data Inserts
-- ========================

-- Pharmacies
INSERT INTO Pharmacy (Name, Location, ContactNumber, Email) VALUES
('Kampala Central Pharmacy', 'Kampala - Central Division', '0772 123456', 'info@kampalacentral.ug'),
('Entebbe Lakeside Pharmacy', 'Entebbe - Kitoro', '0782 654321', 'contact@entebbelakeside.ug');

-- Suppliers
INSERT INTO Supplier (Name, ContactPerson, Phone, Email, Address) VALUES
('Uganda Medical Stores', 'Namuganza Grace', '0414 200100', 'orders@ums.ug', 'Namanve Industrial Park'),
('Kampala Pharma Distributors', 'Okello Peter', '0393 220220', 'sales@kpd.ug', '10 Kampala Road');

-- Customers
INSERT INTO Customer (FullName, Phone, Address) VALUES
('Mukasa John', '0701 111111', 'Ntinda, Kampala'),
('Achan Jane', '0702 222222', 'Gulu Town');

-- Employees
INSERT INTO Employee (PharmacyID, FullName, Role, Username, PasswordHash) VALUES
(1, 'Nansubuga Emily', 'Pharmacist', 'enansubuga', 'hash_enansubuga'),
(1, 'Kato Mark', 'Cashier', 'mkato', 'hash_mkato'),
(2, 'Nalongo Aisha', 'Admin', 'admin_entebbe', 'hash_admin_entebbe');

-- Medicines (per pharmacy)
INSERT INTO Medicine (
  PharmacyID, Name, Category, Brand, UnitPrice, QuantityInStock, ExpiryDate, ReorderLevel
) VALUES
(1, 'Paracetamol 500mg', 'Analgesic', 'CiplaQCIL', 2500.00, 500, '2026-12-31', 100),
(1, 'Amoxicillin 250mg', 'Antibiotic', 'CiplaQCIL', 5700.00, 200, '2026-06-30', 50),
(2, 'Ibuprofen 200mg', 'Anti-inflammatory', 'Abacus', 3200.00, 350, '2026-11-30', 80);

-- Supplies (link suppliers to medicines)
INSERT INTO Supply (SupplierID, MedicineID, SupplyDate, QuantitySupplied, UnitCost) VALUES
(1, 1, '2025-01-15', 300, 1800.00),
(2, 1, '2025-03-10', 200, 1900.00),
(2, 2, '2025-02-20', 200, 4200.00),
(1, 3, '2025-01-25', 350, 2400.00);

-- Prescriptions
INSERT INTO Prescription (CustomerID, DoctorName, DateIssued) VALUES
(1, 'Dr. S. Kaggwa', '2025-04-01'),
(2, 'Dr. R. Nansamba', '2025-04-05');

-- Prescription Details
INSERT INTO PrescriptionDetail (PrescriptionID, MedicineID, Dosage, Duration, Quantity) VALUES
(1, 2, '1 cap TID', '7 days', 21),
(2, 3, '1 tab BID', '5 days', 10);

-- Sales
INSERT INTO Sale (CustomerID, SaleDate, TotalAmount) VALUES
(1, '2025-04-02', 25000.00),
(2, '2025-04-06', 32000.00);

-- Sale Details
INSERT INTO SaleDetail (SaleID, MedicineID, QuantitySold, SellingPrice) VALUES
(1, 1, 10, 2500.00),  -- Total 25,000 UGX
(2, 3, 10, 3200.00);  -- Total 32,000 UGX