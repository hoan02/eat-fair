-- Thêm cột vào bảng members
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS is_group_leader BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Thêm cột vào bảng expenses
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS participants UUID[] DEFAULT NULL;

-- Thêm cột vào bảng payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES members(id);

-- Tạo bảng food_items
CREATE TABLE IF NOT EXISTS food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  default_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm dữ liệu mẫu cho food_items
INSERT INTO food_items (name, default_price, description, category) VALUES
('Phở bò', 50000, 'Phở bò truyền thống', 'Món chính'),
('Bún chả', 45000, 'Bún chả Hà Nội', 'Món chính'),
('Cơm tấm', 40000, 'Cơm tấm sườn bì chả', 'Món chính'),
('Bánh mì', 20000, 'Bánh mì thịt', 'Ăn nhẹ'),
('Gỏi cuốn', 35000, 'Gỏi cuốn tôm thịt', 'Khai vị'),
('Chả giò', 30000, 'Chả giò rán', 'Khai vị'),
('Cà phê sữa đá', 25000, 'Cà phê sữa đá', 'Đồ uống'),
('Trà đá', 5000, 'Trà đá', 'Đồ uống'),
('Nước ép cam', 30000, 'Nước ép cam tươi', 'Đồ uống'),
('Bia Hà Nội', 15000, 'Bia Hà Nội', 'Đồ uống');

-- Cập nhật một thành viên làm trưởng nhóm
UPDATE members
SET is_group_leader = true
WHERE id = (SELECT id FROM members LIMIT 1);
