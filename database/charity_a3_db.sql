-- MySQL dump 10.13  Distrib 9.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: charity_a3_db
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '1b90f0e8-55e7-11f1-b1ac-025004129257:1-63';

--
-- Current Database: `charity_a3_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `charity_a3_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `charity_a3_db`;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Fun Run','Outdoor running charity events'),(2,'Charity Concert','Live music fundraising shows'),(3,'Workshop','Educational and skill-sharing charity workshops'),(4,'Gala Dinner','Formal dinner fundraising events'),(5,'Community Fair','Local community market and charity stalls');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charity`
--

DROP TABLE IF EXISTS `charity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charity` (
  `charity_id` int NOT NULL AUTO_INCREMENT,
  `charity_name` varchar(150) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(30) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`charity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charity`
--

LOCK TABLES `charity` WRITE;
/*!40000 ALTER TABLE `charity` DISABLE KEYS */;
INSERT INTO `charity` VALUES (1,'Sydney Community Charity','contact@sydcommunity.org','02-91234567','Local charity supporting disadvantaged families in Sydney'),(2,'Green Future Foundation','info@greenfuture.org.au','02-97654321','Environmental charity for tree planting and climate education'),(3,'Kids Hope Australia','support@kidshope.org','02-99887766','Charity helping children living in poverty');
/*!40000 ALTER TABLE `charity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `charity_id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `event_date` date NOT NULL,
  `location` varchar(255) NOT NULL,
  `purpose` text,
  `ticket_price` decimal(10,2) NOT NULL,
  `goal_amount` decimal(12,2) DEFAULT NULL,
  `current_amount` decimal(12,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `charity_id` (`charity_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `event_ibfk_1` FOREIGN KEY (`charity_id`) REFERENCES `charity` (`charity_id`) ON DELETE RESTRICT,
  CONSTRAINT `event_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_current_amount` CHECK ((`current_amount` >= 0)),
  CONSTRAINT `chk_event_status` CHECK ((`status` in (_utf8mb4'Active',_utf8mb4'Past',_utf8mb4'Suspended'))),
  CONSTRAINT `chk_goal_amount` CHECK ((`goal_amount` >= 0)),
  CONSTRAINT `chk_ticket_price` CHECK ((`ticket_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,1,1,'Sydney Charity Fun Run','5km community run to raise money for poor families','2026-11-10','Centennial Park Sydney','Fund support for low-income households',25.00,5000.00,2100.00,'Active','/images/funrun.jpg',-33.8879000,151.2306000),(2,2,2,'Green Future Charity Concert','Live band concert for environmental protection','2026-11-15','Sydney Town Hall','Raise fund for urban reforestation',45.00,8000.00,3600.00,'Active','/images/concert.jpg',-33.8731000,151.2072000),(3,3,3,'Children Mental Health Workshop','Free workshop for parents and children','2026-11-20','Parramatta Community Centre','Mental health education for kids',0.00,2000.00,800.00,'Active','/images/workshop.jpg',-33.8147000,151.0018000),(4,1,5,'Winter Community Charity Fair','Market stalls to collect winter supplies','2026-08-05','Bondi Community Hall','Collect warm clothes for homeless people',0.00,3000.00,3000.00,'Past','/images/fair.jpg',-33.8916000,151.2765000);
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration`
--

DROP TABLE IF EXISTS `registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration` (
  `registration_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `tickets` int NOT NULL,
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`registration_id`),
  UNIQUE KEY `uk_event_email` (`event_id`,`email`),
  CONSTRAINT `registration_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_tickets` CHECK ((`tickets` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration`
--

LOCK TABLES `registration` WRITE;
/*!40000 ALTER TABLE `registration` DISABLE KEYS */;
INSERT INTO `registration` VALUES (1,1,'Alice Smith','alice@example.com','0412000001',2,'2026-10-18 09:10:00'),(2,1,'Bob Johnson','bob@example.com','0412000002',1,'2026-10-18 09:15:00'),(3,1,'Charlie Lee','charlie@example.com','0412000003',3,'2026-10-18 10:22:00'),(4,2,'Diana Wang','diana@example.com','0412000004',2,'2026-10-18 13:41:00'),(5,2,'Ethan Brown','ethan@example.com','0412000005',1,'2026-10-18 14:00:00'),(6,2,'Fiona Clark','fiona@example.com','0412000006',4,'2026-10-18 15:30:00'),(7,3,'George Hall','george@example.com','0412000007',2,'2026-10-18 16:10:00'),(8,3,'Hannah Miller','hannah@example.com','0412000008',1,'2026-10-18 16:45:00'),(9,4,'Ivy Wilson','ivy@example.com','0412000009',5,'2026-10-18 17:20:00'),(10,4,'Jack Taylor','jack@example.com','0412000010',2,'2026-10-18 17:55:00');
/*!40000 ALTER TABLE `registration` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 18:11:20
