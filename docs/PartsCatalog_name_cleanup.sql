-- Additional high-confidence missing fuel and air/intake spare parts

if not exists (select 1 from BasicProduct where ProductName = 'Laddtryckssensor')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7449, 'Motor', 'Laddtryckssensor', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Intercoolerslang')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7450, 'Motor', 'Intercoolerslang', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Tryckrör laddluft')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7451, 'Motor', 'Tryckrör laddluft', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Laddtrycksreglerventil')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7452, 'Motor', 'Laddtrycksreglerventil', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Turboledning')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7453, 'Motor', 'Turboledning', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Bränsletrycksgivare')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7454, 'Bränslesystem', 'Bränsletrycksgivare', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Intercoolerrör')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7455, 'Motor', 'Intercoolerrör', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Laddluftsrör')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7456, 'Motor', 'Laddluftsrör', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Turboslang')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7457, 'Motor', 'Turboslang', 1, 'pcs', 25, 1, 1);

if not exists (select 1 from BasicProduct where ProductName = 'Luftslang')
	insert into BasicProduct(ProductId, ProductCategory, ProductName, Quantity, Unit, VatPercentage, IsActive, IsBaseProduct)
	values (7458, 'Motor', 'Luftslang', 1, 'pcs', 25, 1, 1);
