DROP TABLE IF EXISTS payment_by_drug;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS prescription;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS drug;
DROP TABLE IF EXISTS company;

-- Company dimension table
CREATE TABLE company (
    company_id VARCHAR(20) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL
);


-- Doctor dimension table
CREATE TABLE doctor (
    npi BIGINT PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100),
    specialty VARCHAR(150),
    primary_type VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255)
);


-- Drug dimension table
CREATE TABLE drug (
    drug_id INT PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255)
);


-- Prescription fact table
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


-- Payment fact table
CREATE TABLE payment (
    record_id BIGINT PRIMARY KEY,
    npi BIGINT NOT NULL,
    company_id VARCHAR(20) NOT NULL,
    amount DECIMAL(18,2),
    number_of_payments INT,
    nature_of_payments VARCHAR(500),
    form_of_payments VARCHAR(255),
    CONSTRAINT fk_payment_npi FOREIGN KEY (npi) REFERENCES doctor(npi),
    CONSTRAINT fk_payment_company_id FOREIGN KEY (company_id) REFERENCES company(company_id)
);



-- Payment by drug fact table
CREATE TABLE payment_by_drug (
    record_id BIGINT NOT NULL,
    drug_id INT NOT NULL,
    PRIMARY KEY (record_id, drug_id),
    CONSTRAINT fk_payment_record_id FOREIGN KEY (record_id) REFERENCES payment(record_id),
    CONSTRAINT fk_payment_drug_id FOREIGN KEY (drug_id) REFERENCES drug(drug_id)
);