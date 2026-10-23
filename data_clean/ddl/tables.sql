-- Company dimension table
DROP TABLE IF EXISTS company;
CREATE TABLE company (
    company_id VARCHAR(20) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL
);


-- Doctor dimension table
DROP TABLE IF EXISTS doctor;
CREATE TABLE doctor (
    npi BIGINT PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100),
    city VARCHAR(100),
    specialty VARCHAR(150),
    primary_type VARCHAR(150),
    state VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255)
);


-- Drug dimension table
DROP TABLE IF EXISTS drug;
CREATE TABLE drug (
    drug_id INT PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255)
);


-- Prescription fact table
DROP TABLE IF EXISTS prescription;
CREATE TABLE prescription (
    npi BIGINT NOT NULL,
    drug_id INT NOT NULL,
    total_claims INT,
    total_day_supply INT,
    total_drug_cost DECIMAL(18,2),
    total_beneficiaries INT,
    PRIMARY KEY (npi, drug_id),
    
    CONSTRAINT fk_npi FOREIGN KEY (npi) REFERENCES doctor(npi),
    CONSTRAINT fk_drug_id FOREIGN KEY (drug_id) REFERENCES drug(drug_id)
);
