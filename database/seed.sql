USE intelsense_db;

INSERT INTO users (first_name, last_name, email, password, role_id) VALUES
('Admin', 'User', 'admin@intelsense.com', '$2a$10$8e7f0w3Dg2Xee9YV4sW1YurqWZA3J7A1YgK2LhYq3I4eR9fVqRzUy', 1),
('Sample', 'Customer', 'customer@intelsense.com', '$2a$10$8e7f0w3Dg2Xee9YV4sW1YurqWZA3J7A1YgK2LhYq3I4eR9fVqRzUy', 2);

INSERT INTO reviews (user_id, product_name, review_text, rating) VALUES
(2, 'Smartphone', 'Excellent battery life and very fast performance.', 5),
(2, 'Laptop', 'The laptop is good but delivery was delayed.', 3),
(2, 'Headphones', 'Poor sound quality and uncomfortable fit.', 2);
