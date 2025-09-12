# Скрипт для создания базы данных MySQL
$mysqlPath = "mysql"
$sqlFile = "C:\Users\Lenovo\Desktop\сетка\tournament-grid\create_mysql_database.sql"
$user = "root"
$password = "root"

# Создание базы данных
Write-Host "Создание базы данных..."
$mysqlCmd = "$mysqlPath -u $user -p$password < `"$sqlFile`""

# В PowerShell перенаправление работает иначе, поэтому используем Get-Content и передаем содержимое через stdin
Get-Content $sqlFile | & $mysqlPath -u $user -p$password

Write-Host "База данных создана успешно!"