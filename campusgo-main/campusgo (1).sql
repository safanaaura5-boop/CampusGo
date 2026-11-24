-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 03, 2026 at 08:03 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campusgo`
--

-- --------------------------------------------------------

--
-- Table structure for table `couriers`
--

CREATE TABLE `couriers` (
  `courier_id` int NOT NULL,
  `user_id` int NOT NULL,
  `vehicle_type` enum('MOTORCYCLE','BICYCLE') NOT NULL,
  `availability_status` enum('AVAILABLE','BUSY','OFFLINE') DEFAULT 'OFFLINE',
  `current_location` point NOT NULL SRID 4326
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `couriers`
--

INSERT INTO `couriers` (`courier_id`, `user_id`, `vehicle_type`, `availability_status`, `current_location`) VALUES
(1, 4, 'MOTORCYCLE', 'AVAILABLE', 0xe61000000101000000a245b6f3fd845a40aaf1d24d629000c0),
(2, 5, 'MOTORCYCLE', 'BUSY', 0xe6100000010100000077be9f1a2f855a4025068195438b00c0),
(3, 6, 'BICYCLE', 'OFFLINE', 0xe61000000101000000f853e3a59b845a404a0c022b879600c0);

-- --------------------------------------------------------

--
-- Table structure for table `delivery_routes`
--

CREATE TABLE `delivery_routes` (
  `route_id` int NOT NULL,
  `order_id` int NOT NULL,
  `route_geometry` linestring NOT NULL SRID 4326,
  `distance_km` decimal(5,2) DEFAULT '0.00',
  `estimated_duration` int DEFAULT '0' COMMENT 'dalam menit'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `delivery_routes`
--

INSERT INTO `delivery_routes` (`route_id`, `order_id`, `route_geometry`, `distance_km`, `estimated_duration`) VALUES
(1, 1, 0xe6100000010200000007000000c520b07268855a40e5d022dbf97e00c0de73603942855a40e5d022dbf97e00c00f09dffb1b855a40e5d022dbf97e00c0295c8fc2f5845a40e5d022dbf97e00c0295c8fc2f5845a405ff0694e5e8400c0295c8fc2f5845a40decce847c38900c0295c8fc2f5845a4057ec2fbb278f00c0, 1.66, 5),
(2, 2, 0xe610000001020000000700000077be9f1a2f855a40f0a7c64b378900c0b3791c06f3845a40f0a7c64b378900c0d8f2caf5b6845a40f0a7c64b378900c014ae47e17a845a40f0a7c64b378900c014ae47e17a845a402ae27492ad8e00c014ae47e17a845a405f5feb52239400c014ae47e17a845a409a999999999900c0, 2.11, 6),
(3, 3, 0xe61000000102000000070000007593180456865a40448b6ce7fba900c052b81e85eb855a40448b6ce7fba900c02fdd240681855a40448b6ce7fba900c00c022b8716855a40448b6ce7fba900c00c022b8716855a40ec8a19e1eda100c00c022b8716855a408ecd8e54df9900c00c022b8716855a4036cd3b4ed19100c0, 3.48, 10),
(4, 6, 0xe6100000010200000005000000b7d100de02855a40cb10c7bab88d00c0e2e995b20c855a40cb10c7bab88d00c00c022b8716855a40cb10c7bab88d00c00c022b8716855a40006f8104c58f00c00c022b8716855a4036cd3b4ed19100c0, 0.36, 3);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `courier_id` int DEFAULT NULL,
  `pickup_address` varchar(255) NOT NULL,
  `destination_address` varchar(255) NOT NULL,
  `pickup_location` point NOT NULL SRID 4326,
  `destination_location` point NOT NULL SRID 4326,
  `item_description` varchar(255) NOT NULL,
  `order_status` enum('PENDING','ASSIGNED','PICKED_UP','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `customer_id`, `courier_id`, `pickup_address`, `destination_address`, `pickup_location`, `destination_location`, `item_description`, `order_status`, `created_at`) VALUES
(1, 1, 1, 'Kos Putri sekitar Jl. Raya Balunijuk, Merawang', 'Gedung Rektorat UBB, Kampus Terpadu UBB Balunijuk', 0xe61000000101000000c520b07268855a40e5d022dbf97e00c0, 0xe61000000101000000295c8fc2f5845a4057ec2fbb278f00c0, 'Berkas proposal PKM dalam map plastik', 'DELIVERED', '2026-11-02 01:10:00'),
(2, 2, 1, 'Kantin sekitar Kampus Terpadu UBB, Balunijuk', 'Kos Putra Blok B, Desa Balunijuk, Merawang', 0xe6100000010100000077be9f1a2f855a40f0a7c64b378900c0, 0xe6100000010100000014ae47e17a845a409a999999999900c0, 'Nasi ayam geprek 2 porsi', 'DELIVERED', '2026-11-02 02:00:00'),
(3, 3, 2, 'Toko Jl. Raya Balunijuk arah Pangkalpinang', 'Fakultas Teknik UBB, Kampus Terpadu UBB Balunijuk', 0xe610000001010000007593180456865a40448b6ce7fba900c0, 0xe610000001010000000c022b8716855a4036cd3b4ed19100c0, 'Paket belanja online ukuran sedang', 'PICKED_UP', '2026-11-03 01:20:00'),
(4, 2, NULL, 'Fotokopi dan Percetakan Jl. Raya Balunijuk', 'Gedung Serba Guna UBB, Kampus Terpadu UBB Balunijuk', 0xe61000000101000000a8c64b3789855a407b14ae47e17a00c0, 0xe61000000101000000be9f1a2fdd845a403f355eba498c00c0, 'Cetak dan jilid proposal 3 rangkap', 'PENDING', '2026-11-03 01:35:00'),
(5, 3, NULL, 'Kos Putri sekitar Jl. Raya Balunijuk, Merawang', 'Perpustakaan UBB, Kampus Terpadu UBB Balunijuk', 0xe61000000101000000c520b07268855a40e5d022dbf97e00c0, 0xe61000000101000000b7d100de02855a40cb10c7bab88d00c0, 'Charger laptop yang tertinggal di kos', 'CANCELLED', '2026-11-02 03:00:00'),
(6, 1, 3, 'Perpustakaan UBB, Kampus Terpadu UBB Balunijuk', 'Fakultas Teknik UBB, Kampus Terpadu UBB Balunijuk', 0xe61000000101000000b7d100de02855a40cb10c7bab88d00c0, 0xe610000001010000000c022b8716855a4036cd3b4ed19100c0, 'Buku referensi skripsi', 'DELIVERED', '2026-11-02 04:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int NOT NULL,
  `order_id` int NOT NULL,
  `payment_method` enum('CASH','TRANSFER','QRIS','E_WALLET') NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('PENDING','PAID','CANCELLED') DEFAULT 'PENDING',
  `paid_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `order_id`, `payment_method`, `delivery_fee`, `payment_status`, `paid_at`) VALUES
(1, 1, 'QRIS', 5000.00, 'PAID', '2026-11-02 01:30:00'),
(2, 2, 'CASH', 8000.00, 'PAID', '2026-11-02 02:20:00'),
(3, 3, 'CASH', 8000.00, 'PENDING', NULL),
(4, 4, 'QRIS', 5000.00, 'PENDING', NULL),
(5, 5, 'TRANSFER', 5000.00, 'CANCELLED', NULL),
(6, 6, 'E_WALLET', 5000.00, 'PAID', '2026-11-02 04:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `rating_id` int NOT NULL,
  `order_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `courier_id` int NOT NULL,
  `score` tinyint NOT NULL,
  `review` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`rating_id`, `order_id`, `customer_id`, `courier_id`, `score`, `review`, `created_at`) VALUES
(1, 1, 1, 1, 5, 'Cepat dan berkasnya aman sampai di rektorat.', '2026-11-02 01:35:00'),
(2, 2, 2, 1, 4, 'Makanan masih hangat, hanya sedikit menunggu di kantin.', '2026-11-02 02:25:00'),
(3, 6, 1, 3, 5, 'Buku sampai tepat waktu sebelum bimbingan.', '2026-11-02 04:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('CUSTOMER','COURIER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `phone_number`, `email`, `role`, `created_at`) VALUES
(1, 'Rina Pelanggan', '081200000001', 'rina.pelanggan@mail.com', 'CUSTOMER', '2026-11-02 00:30:00'),
(2, 'Dimas Pelanggan', '081200000002', 'dimas.pelanggan@mail.com', 'CUSTOMER', '2026-11-02 00:30:00'),
(3, 'Sinta Pelanggan', '081200000003', 'sinta.pelanggan@mail.com', 'CUSTOMER', '2026-11-02 00:30:00'),
(4, 'Budi Kurir', '081200000004', 'budi.kurir@mail.com', 'COURIER', '2026-11-02 00:30:00'),
(5, 'Sari Kurir', '081200000005', 'sari.kurir@mail.com', 'COURIER', '2026-11-02 00:30:00'),
(6, 'Fajar Kurir', '081200000006', 'fajar.kurir@mail.com', 'COURIER', '2026-11-02 00:30:00'),
(7, 'Admin CampusGo', '081200000007', 'admin@campusgo.id', 'ADMIN', '2026-11-02 00:30:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `couriers`
--
ALTER TABLE `couriers`
  ADD PRIMARY KEY (`courier_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD SPATIAL KEY `current_location` (`current_location`);

--
-- Indexes for table `delivery_routes`
--
ALTER TABLE `delivery_routes`
  ADD PRIMARY KEY (`route_id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD SPATIAL KEY `route_geometry` (`route_geometry`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `courier_id` (`courier_id`),
  ADD SPATIAL KEY `pickup_location` (`pickup_location`),
  ADD SPATIAL KEY `destination_location` (`destination_location`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `courier_id` (`courier_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `couriers`
--
ALTER TABLE `couriers`
  MODIFY `courier_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `delivery_routes`
--
ALTER TABLE `delivery_routes`
  MODIFY `route_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `rating_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `couriers`
--
ALTER TABLE `couriers`
  ADD CONSTRAINT `couriers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `delivery_routes`
--
ALTER TABLE `delivery_routes`
  ADD CONSTRAINT `delivery_routes_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`courier_id`) REFERENCES `couriers` (`courier_id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`courier_id`) REFERENCES `couriers` (`courier_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
