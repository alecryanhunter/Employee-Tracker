INSERT INTO departments (name) 
    VALUES 
    ("Engineering"),
    ("Production Control"),
    ("Wood Shop"),
    ("Metal Shop"),
    ("Production");

INSERT INTO roles (title, salary, department_id)
    VALUES
    ("Engineering Lead",120000,1),
    ("Mechanical Engineer",90000,1),
    ("Electrical Engineer",100000,1),
    ("Drafter",65000,1),
    -- Production Control
    ("Master Scheduler",110000,2),
    ("Scheduler",50000,2),
    -- Wood Shop
    ("Wood Shop Lead",40000,3),
    ("Wood Shop Operator",25000,3),
    -- Metal Shop
    ("Metal Shop Lead",45000,4),
    ("Metal Shop Operator",30000,4),
    -- Production
    ("Shift Lead",40000,5),
    ("Production Technician",25000,5),
    ("Crew",20000,5);

INSERT INTO employees (first_name,last_name,role_id,manager_id)
    VALUES
    -- Engineering
    ("Samuel","Finkley",1,null),
    ("Janice","Oberman",2,1),
    ("Wallace","Grennan",2,1),
    ("Nadine","Insmuth",3,1),
    ("Henrietta","Gomez",4,2),
    -- Production Control
    ("Juan","Smith",5,null),
    ("Satoshi","Numqua",6,6),
    -- Wood Shop
    ("Jeffrey","Studebaker",7,6),
    ("Shin","Oppenheimer",8,8),
    ("Douglas","Chambers",8,8),
    -- Metal Shop
    ("Carol","Umberland",9,6),
    ("Cynthia","Floretto",10,11),
    ("Gabi","Katarzyna",10,11),
    -- Production
    ("Tessa","Gabuchol",11,6),
    ("Eleanor","Dagoberto",12,14),
    ("Howard","Dunlevy",13,14),
    ("Dustin","Grey",13,14);