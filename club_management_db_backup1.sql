-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: clubhub
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcement`
--

DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
  `Announcement_ID` varchar(20) NOT NULL,
  `Club_ID` varchar(20) NOT NULL,
  `Department_ID` varchar(20) DEFAULT NULL,
  `Event_ID` varchar(20) DEFAULT NULL,
  `Created_By` varchar(20) NOT NULL,
  `Title` varchar(150) NOT NULL,
  `Content` varchar(1000) NOT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Announcement_ID`),
  KEY `Club_ID` (`Club_ID`),
  KEY `Department_ID` (`Department_ID`),
  KEY `Event_ID` (`Event_ID`),
  KEY `Created_By` (`Created_By`),
  CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`Club_ID`) REFERENCES `club` (`Club_ID`),
  CONSTRAINT `announcement_ibfk_2` FOREIGN KEY (`Department_ID`) REFERENCES `department` (`Department_ID`),
  CONSTRAINT `announcement_ibfk_3` FOREIGN KEY (`Event_ID`) REFERENCES `event` (`Event_ID`),
  CONSTRAINT `announcement_ibfk_4` FOREIGN KEY (`Created_By`) REFERENCES `student` (`Student_ID`),
  CONSTRAINT `announcement_chk_1` CHECK ((((`Department_ID` is null) and (`Event_ID` is null)) or ((`Department_ID` is not null) and (`Event_ID` is null)) or ((`Department_ID` is null) and (`Event_ID` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
INSERT INTO `announcement` VALUES ('A001','C001',NULL,NULL,'S001','Music Night Registration','Registrations are now open for Music Night.','2026-09-01 15:58:16'),('A002','C002','D004',NULL,'S006','Music Department Meeting','Music department members should attend the meeting tomorrow.','2026-09-01 15:58:16'),('A003','C002',NULL,'E002','S004','Short Film Festival','The Short Film Festival will be held on September 20.','2026-09-01 15:58:16');
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `Event_ID` varchar(20) NOT NULL,
  `Student_ID` varchar(20) NOT NULL,
  `Status` varchar(20) NOT NULL,
  `Check_In_Time` datetime DEFAULT NULL,
  PRIMARY KEY (`Event_ID`,`Student_ID`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`Event_ID`, `Student_ID`) REFERENCES `event_registration` (`Event_ID`, `Student_ID`),
  CONSTRAINT `attendance_chk_1` CHECK ((`Status` in (_utf8mb4'PRESENT',_utf8mb4'ABSENT')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES ('E001','S001','PRESENT','2026-09-15 17:45:00'),('E001','S002','PRESENT','2026-09-15 17:52:00'),('E001','S003','ABSENT',NULL),('E002','S004','PRESENT','2026-09-20 16:40:00'),('E002','S006','PRESENT','2026-09-20 16:50:00'),('E002','S007','ABSENT',NULL);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club`
--

DROP TABLE IF EXISTS `club`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club` (
  `Club_ID` varchar(20) NOT NULL,
  `Club_Name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Category` varchar(50) NOT NULL,
  `Faculty_ID` varchar(20) NOT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`Club_ID`),
  UNIQUE KEY `Club_Name` (`Club_Name`),
  KEY `Faculty_ID` (`Faculty_ID`),
  CONSTRAINT `club_ibfk_1` FOREIGN KEY (`Faculty_ID`) REFERENCES `faculty` (`Faculty_ID`),
  CONSTRAINT `club_chk_1` CHECK ((`Status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club`
--

LOCK TABLES `club` WRITE;
/*!40000 ALTER TABLE `club` DISABLE KEYS */;
INSERT INTO `club` VALUES ('C001','Music Club','College music and performing arts club','Cultural','F003','2026-09-01 15:58:16','ACTIVE'),('C002','Short Film Club','Club for filmmaking and visual storytelling','Media','F002','2026-09-01 15:58:16','ACTIVE'),('C003','Coding Club','Programming and technology club','Technical','F001','2026-09-01 15:58:16','ACTIVE');
/*!40000 ALTER TABLE `club` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `club_member_overview`
--

DROP TABLE IF EXISTS `club_member_overview`;
/*!50001 DROP VIEW IF EXISTS `club_member_overview`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `club_member_overview` AS SELECT 
 1 AS `Club_ID`,
 1 AS `Club_Name`,
 1 AS `Student_ID`,
 1 AS `Name`,
 1 AS `Role_Name`,
 1 AS `Status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `club_task_progress`
--

DROP TABLE IF EXISTS `club_task_progress`;
/*!50001 DROP VIEW IF EXISTS `club_task_progress`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `club_task_progress` AS SELECT 
 1 AS `Club_ID`,
 1 AS `Club_Name`,
 1 AS `Total_Tasks`,
 1 AS `Completed_Tasks`,
 1 AS `Completion_Percentage`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `Department_ID` varchar(20) NOT NULL,
  `Club_ID` varchar(20) NOT NULL,
  `Department_Name` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`Department_ID`),
  UNIQUE KEY `Club_ID` (`Club_ID`,`Department_Name`),
  UNIQUE KEY `Department_ID` (`Department_ID`,`Club_ID`),
  UNIQUE KEY `Department_ID_2` (`Department_ID`,`Club_ID`),
  CONSTRAINT `department_ibfk_1` FOREIGN KEY (`Club_ID`) REFERENCES `club` (`Club_ID`),
  CONSTRAINT `department_chk_1` CHECK ((`Status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES ('D001','C002','Direction','Handles direction and creative decisions','2026-09-01 15:58:16','ACTIVE'),('D002','C002','Cinematography','Handles camera and visual production','2026-09-01 15:58:16','ACTIVE'),('D003','C002','Editing','Handles video and post-production','2026-09-01 15:58:16','ACTIVE'),('D004','C002','Music','Handles music and sound','2026-09-01 15:58:16','ACTIVE'),('D005','C003','Development','Handles software development','2026-09-01 15:58:16','ACTIVE'),('D006','C003','Design','Handles UI and visual design','2026-09-01 15:58:16','ACTIVE'),('D007','C001','Performance','Handles performances and stage activities','2026-09-01 15:58:16','ACTIVE');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department_membership`
--

DROP TABLE IF EXISTS `department_membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_membership` (
  `Student_ID` varchar(20) NOT NULL,
  `Club_ID` varchar(20) DEFAULT NULL,
  `Department_ID` varchar(20) NOT NULL,
  `Role_ID` varchar(20) DEFAULT NULL,
  `Joined_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`Student_ID`,`Department_ID`),
  KEY `Student_ID` (`Student_ID`,`Club_ID`),
  KEY `Department_ID` (`Department_ID`,`Club_ID`),
  KEY `Role_ID` (`Role_ID`),
  CONSTRAINT `department_membership_ibfk_1` FOREIGN KEY (`Student_ID`, `Club_ID`) REFERENCES `membership` (`Student_ID`, `Club_ID`),
  CONSTRAINT `department_membership_ibfk_2` FOREIGN KEY (`Department_ID`, `Club_ID`) REFERENCES `department` (`Department_ID`, `Club_ID`),
  CONSTRAINT `department_membership_ibfk_3` FOREIGN KEY (`Role_ID`) REFERENCES `role` (`Role_ID`),
  CONSTRAINT `department_membership_chk_1` CHECK ((`Status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department_membership`
--

LOCK TABLES `department_membership` WRITE;
/*!40000 ALTER TABLE `department_membership` DISABLE KEYS */;
INSERT INTO `department_membership` VALUES ('S001','C003','D006','R003','2026-09-01 15:58:16','ACTIVE'),('S001','C001','D007','R001','2026-09-01 15:58:16','ACTIVE'),('S002','C003','D005','R002','2026-09-01 15:58:16','ACTIVE'),('S003','C001','D007','R003','2026-09-01 15:58:16','ACTIVE'),('S004','C002','D001','R001','2026-09-01 15:58:16','ACTIVE'),('S005','C003','D005','R001','2026-09-01 15:58:16','ACTIVE'),('S006','C002','D003','R003','2026-09-01 15:58:16','ACTIVE'),('S006','C002','D004','R002','2026-09-01 15:58:16','ACTIVE'),('S007','C002','D002','R003','2026-09-01 15:58:16','ACTIVE');
/*!40000 ALTER TABLE `department_membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `department_task_progress`
--

DROP TABLE IF EXISTS `department_task_progress`;
/*!50001 DROP VIEW IF EXISTS `department_task_progress`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `department_task_progress` AS SELECT 
 1 AS `Department_ID`,
 1 AS `Department_Name`,
 1 AS `Total_Tasks`,
 1 AS `Completed_Tasks`,
 1 AS `Completion_Percentage`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `Event_ID` varchar(20) NOT NULL,
  `Club_ID` varchar(20) NOT NULL,
  `Event_Name` varchar(150) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Event_Date` datetime NOT NULL,
  `Venue` varchar(150) NOT NULL,
  `Capacity` int NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'UPCOMING',
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Event_ID`),
  KEY `Club_ID` (`Club_ID`),
  KEY `idx_event_date` (`Event_Date`),
  CONSTRAINT `event_ibfk_1` FOREIGN KEY (`Club_ID`) REFERENCES `club` (`Club_ID`),
  CONSTRAINT `event_chk_1` CHECK ((`Capacity` > 0)),
  CONSTRAINT `event_chk_2` CHECK ((`Status` in (_utf8mb4'UPCOMING',_utf8mb4'ONGOING',_utf8mb4'COMPLETED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES ('E001','C001','Music Night','Annual college music performance','2026-09-15 18:00:00','Main Auditorium',100,'UPCOMING','2026-09-01 15:58:16'),('E002','C002','Short Film Festival','Screening of student short films','2026-09-20 17:00:00','Mini Auditorium',80,'UPCOMING','2026-09-01 15:58:16'),('E003','C003','CodeFest','College coding competition','2026-09-25 09:00:00','Computer Lab 1',60,'UPCOMING','2026-09-01 15:58:16');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_department`
--

DROP TABLE IF EXISTS `event_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_department` (
  `Event_ID` varchar(20) NOT NULL,
  `Department_ID` varchar(20) NOT NULL,
  `Responsibility` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Event_ID`,`Department_ID`),
  KEY `Department_ID` (`Department_ID`),
  CONSTRAINT `event_department_ibfk_1` FOREIGN KEY (`Event_ID`) REFERENCES `event` (`Event_ID`),
  CONSTRAINT `event_department_ibfk_2` FOREIGN KEY (`Department_ID`) REFERENCES `department` (`Department_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_department`
--

LOCK TABLES `event_department` WRITE;
/*!40000 ALTER TABLE `event_department` DISABLE KEYS */;
INSERT INTO `event_department` VALUES ('E002','D001','Direct the overall event'),('E002','D002','Handle event photography and cinematography'),('E002','D003','Prepare and edit promotional videos'),('E002','D004','Handle background music and sound'),('E003','D005','Handle coding competition platform'),('E003','D006','Design event posters and interface');
/*!40000 ALTER TABLE `event_department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_registration`
--

DROP TABLE IF EXISTS `event_registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registration` (
  `Event_ID` varchar(20) NOT NULL,
  `Student_ID` varchar(20) NOT NULL,
  `Registered_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` varchar(20) NOT NULL DEFAULT 'REGISTERED',
  PRIMARY KEY (`Event_ID`,`Student_ID`),
  KEY `Student_ID` (`Student_ID`),
  CONSTRAINT `event_registration_ibfk_1` FOREIGN KEY (`Event_ID`) REFERENCES `event` (`Event_ID`),
  CONSTRAINT `event_registration_ibfk_2` FOREIGN KEY (`Student_ID`) REFERENCES `student` (`Student_ID`),
  CONSTRAINT `event_registration_chk_1` CHECK ((`Status` in (_utf8mb4'REGISTERED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registration`
--

LOCK TABLES `event_registration` WRITE;
/*!40000 ALTER TABLE `event_registration` DISABLE KEYS */;
INSERT INTO `event_registration` VALUES ('E001','S001','2026-09-01 15:58:16','REGISTERED'),('E001','S002','2026-09-01 15:58:16','REGISTERED'),('E001','S003','2026-09-01 15:58:16','REGISTERED'),('E002','S004','2026-09-01 15:58:16','REGISTERED'),('E002','S006','2026-09-01 15:58:16','REGISTERED'),('E002','S007','2026-09-01 15:58:16','REGISTERED'),('E003','S001','2026-09-01 15:58:16','REGISTERED'),('E003','S002','2026-09-01 15:58:16','REGISTERED'),('E003','S005','2026-09-01 15:58:16','REGISTERED'),('E003','S007','2026-09-01 15:58:16','CANCELLED');
/*!40000 ALTER TABLE `event_registration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `Faculty_ID` varchar(20) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `School` varchar(50) NOT NULL,
  `Department` varchar(100) NOT NULL,
  PRIMARY KEY (`Faculty_ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES ('F001','Dr. Kumar','kumar@college.edu','9000000001','SAS','Computer Science'),('F002','Dr. Anitha','anitha@college.edu','9000000002','SIS','Visual Communication'),('F003','Dr. Joseph','joseph@college.edu','9000000003','SIS','English');
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership`
--

DROP TABLE IF EXISTS `membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership` (
  `Student_ID` varchar(20) NOT NULL,
  `Club_ID` varchar(20) NOT NULL,
  `Role_ID` varchar(20) DEFAULT NULL,
  `Joined_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` varchar(20) NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`Student_ID`,`Club_ID`),
  KEY `Club_ID` (`Club_ID`),
  KEY `Role_ID` (`Role_ID`),
  KEY `idx_membership_status` (`Status`),
  CONSTRAINT `membership_ibfk_1` FOREIGN KEY (`Student_ID`) REFERENCES `student` (`Student_ID`),
  CONSTRAINT `membership_ibfk_2` FOREIGN KEY (`Club_ID`) REFERENCES `club` (`Club_ID`),
  CONSTRAINT `membership_ibfk_3` FOREIGN KEY (`Role_ID`) REFERENCES `role` (`Role_ID`),
  CONSTRAINT `membership_chk_1` CHECK ((`Status` in (_utf8mb4'PENDING',_utf8mb4'ACTIVE',_utf8mb4'REMOVED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership`
--

LOCK TABLES `membership` WRITE;
/*!40000 ALTER TABLE `membership` DISABLE KEYS */;
INSERT INTO `membership` VALUES ('S001','C001','R001','2026-09-01 15:58:16','ACTIVE'),('S001','C003','R003','2026-09-01 15:58:16','ACTIVE'),('S002','C001','R003','2026-09-01 15:58:16','ACTIVE'),('S002','C003','R002','2026-09-01 15:58:16','ACTIVE'),('S003','C001','R003','2026-09-01 15:58:16','ACTIVE'),('S004','C002','R001','2026-09-01 15:58:16','ACTIVE'),('S005','C003','R001','2026-09-01 15:58:16','ACTIVE'),('S006','C002','R003','2026-09-01 15:58:16','ACTIVE'),('S007','C002','R003','2026-09-01 15:58:16','ACTIVE'),('S008','C003','R003','2026-09-01 15:58:16','PENDING');
/*!40000 ALTER TABLE `membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `Permission_ID` varchar(30) NOT NULL,
  `Permission_Name` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Permission_ID`),
  UNIQUE KEY `Permission_Name` (`Permission_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES ('P001','ADD_MEMBER','Add members to a club'),('P002','REMOVE_MEMBER','Remove members from a club'),('P003','APPROVE_MEMBER','Approve membership requests'),('P004','ASSIGN_ROLE','Assign roles to members'),('P005','CREATE_EVENT','Create club events'),('P006','MANAGE_EVENT','Edit or delete events'),('P007','CREATE_TASK','Create tasks'),('P008','ASSIGN_TASK','Assign tasks to members'),('P009','MANAGE_DEPARTMENT','Manage club departments'),('P010','MANAGE_CLUB','Manage club information'),('P011','VIEW_ACTIVITY','View club activity'),('P012','VIEW_ANNOUNCEMENT','View announcements'),('P013','VIEW_EVENT','View events'),('P014','VIEW_TASK','View assigned tasks'),('P015','UPDATE_TASK','Update task status'),('P016','SUBMIT_WORK','Submit work for a task');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `Role_ID` varchar(20) NOT NULL,
  `Role_Name` varchar(50) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Role_ID`),
  UNIQUE KEY `Role_Name` (`Role_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('R001','President','Leads and manages the entire club'),('R002','Coordinator','Coordinates a department or club activities'),('R003','Member','Regular club member');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `Role_ID` varchar(20) NOT NULL,
  `Permission_ID` varchar(30) NOT NULL,
  PRIMARY KEY (`Role_ID`,`Permission_ID`),
  KEY `Permission_ID` (`Permission_ID`),
  CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`Role_ID`) REFERENCES `role` (`Role_ID`),
  CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`Permission_ID`) REFERENCES `permission` (`Permission_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES ('R001','P001'),('R001','P002'),('R001','P003'),('R001','P004'),('R001','P005'),('R001','P006'),('R001','P007'),('R001','P008'),('R001','P009'),('R001','P010'),('R001','P011'),('R001','P012'),('R003','P012'),('R001','P013'),('R003','P013'),('R001','P014'),('R003','P014'),('R001','P015'),('R003','P015'),('R001','P016'),('R003','P016');
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `Student_ID` varchar(20) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `School` varchar(50) NOT NULL,
  `Program` varchar(100) NOT NULL,
  `Year` tinyint NOT NULL,
  PRIMARY KEY (`Student_ID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `uq_student_email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES ('S001','Arjun Kumar','arjun@college.edu','9876543210','SAS','BCA',2),('S002','Priya Sharma','priya@college.edu','9876543211','SAS','BSc Computer Science',3),('S003','Rahul Raj','rahul@college.edu','9876543212','SAS','BCA',2),('S004','Meera Joseph','meera@college.edu','9876543213','SIS','BA English',3),('S005','Karthik S','karthik@college.edu','9876543214','SAS','BSc Data Science',1),('S006','Ananya Thomas','ananya@college.edu','9876543215','SIS','BA Visual Communication',2),('S007','Vishnu Menon','vishnu@college.edu','9876543216','SAS','BCA',3),('S008','Diya Mathew','diya@college.edu','9876543217','SIS','BA English',1);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `student_task_summary`
--

DROP TABLE IF EXISTS `student_task_summary`;
/*!50001 DROP VIEW IF EXISTS `student_task_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `student_task_summary` AS SELECT 
 1 AS `Student_ID`,
 1 AS `Name`,
 1 AS `Total_Tasks`,
 1 AS `Completed_Tasks`,
 1 AS `In_Progress_Tasks`,
 1 AS `Todo_Tasks`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `Task_ID` varchar(20) NOT NULL,
  `Club_ID` varchar(20) NOT NULL,
  `Department_ID` varchar(20) DEFAULT NULL,
  `Event_ID` varchar(20) DEFAULT NULL,
  `Created_By` varchar(20) NOT NULL,
  `Title` varchar(150) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Priority` varchar(20) NOT NULL DEFAULT 'MEDIUM',
  `Deadline` datetime NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'TODO',
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Task_ID`),
  KEY `Club_ID` (`Club_ID`),
  KEY `Department_ID` (`Department_ID`),
  KEY `Event_ID` (`Event_ID`),
  KEY `Created_By` (`Created_By`),
  KEY `idx_task_deadline` (`Deadline`),
  CONSTRAINT `task_ibfk_1` FOREIGN KEY (`Club_ID`) REFERENCES `club` (`Club_ID`),
  CONSTRAINT `task_ibfk_2` FOREIGN KEY (`Department_ID`) REFERENCES `department` (`Department_ID`),
  CONSTRAINT `task_ibfk_3` FOREIGN KEY (`Event_ID`) REFERENCES `event` (`Event_ID`),
  CONSTRAINT `task_ibfk_4` FOREIGN KEY (`Created_By`) REFERENCES `student` (`Student_ID`),
  CONSTRAINT `task_chk_1` CHECK ((`Priority` in (_utf8mb4'LOW',_utf8mb4'MEDIUM',_utf8mb4'HIGH'))),
  CONSTRAINT `task_chk_2` CHECK ((`Status` in (_utf8mb4'TODO',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES ('T001','C002','D004','E002','S004','Prepare Event Playlist','Prepare the playlist for the short film festival','MEDIUM','2026-09-10 18:00:00','COMPLETED','2026-09-01 15:58:16'),('T002','C002','D002','E002','S004','Camera Setup','Prepare cameras and equipment','HIGH','2026-09-19 15:00:00','IN_PROGRESS','2026-09-01 15:58:16'),('T003','C002','D003','E002','S004','Prepare Festival Teaser','Edit promotional teaser for the festival','HIGH','2026-09-12 18:00:00','COMPLETED','2026-09-01 15:58:16'),('T004','C003','D005','E003','S005','Coding Platform Setup','Prepare the online coding competition platform','HIGH','2026-09-23 18:00:00','TODO','2026-09-01 15:58:16'),('T005','C003','D006','E003','S005','Design Event Poster','Create promotional poster for CodeFest','MEDIUM','2026-09-18 18:00:00','COMPLETED','2026-09-01 15:58:16'),('T006','C001','D007','E001','S001','Prepare Music Performance','Prepare songs and performance sequence','HIGH','2026-09-13 18:00:00','IN_PROGRESS','2026-09-01 15:58:16'),('T007','C001',NULL,NULL,'S001','Recruit New Members','Promote the club and recruit new members','LOW','2026-09-30 18:00:00','TODO','2026-09-01 15:58:16');
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_assignment`
--

DROP TABLE IF EXISTS `task_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_assignment` (
  `Task_ID` varchar(20) NOT NULL,
  `Student_ID` varchar(20) NOT NULL,
  `Assigned_By` varchar(20) NOT NULL,
  `Assigned_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Task_ID`,`Student_ID`),
  KEY `Student_ID` (`Student_ID`),
  KEY `Assigned_By` (`Assigned_By`),
  CONSTRAINT `task_assignment_ibfk_1` FOREIGN KEY (`Task_ID`) REFERENCES `task` (`Task_ID`),
  CONSTRAINT `task_assignment_ibfk_2` FOREIGN KEY (`Student_ID`) REFERENCES `student` (`Student_ID`),
  CONSTRAINT `task_assignment_ibfk_3` FOREIGN KEY (`Assigned_By`) REFERENCES `student` (`Student_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_assignment`
--

LOCK TABLES `task_assignment` WRITE;
/*!40000 ALTER TABLE `task_assignment` DISABLE KEYS */;
INSERT INTO `task_assignment` VALUES ('T001','S006','S004','2026-09-01 15:58:16'),('T002','S007','S004','2026-09-01 15:58:16'),('T003','S006','S004','2026-09-01 15:58:16'),('T004','S002','S005','2026-09-01 15:58:16'),('T005','S001','S005','2026-09-01 15:58:16'),('T006','S003','S001','2026-09-01 15:58:16'),('T007','S002','S001','2026-09-01 15:58:16');
/*!40000 ALTER TABLE `task_assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_submission`
--

DROP TABLE IF EXISTS `task_submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_submission` (
  `Submission_ID` varchar(20) NOT NULL,
  `Task_ID` varchar(20) NOT NULL,
  `Student_ID` varchar(20) NOT NULL,
  `Submitted_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `File_URL` varchar(500) DEFAULT NULL,
  `Comment` varchar(500) DEFAULT NULL,
  `Review_Status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `Reviewed_By` varchar(20) DEFAULT NULL,
  `Reviewed_At` datetime DEFAULT NULL,
  PRIMARY KEY (`Submission_ID`),
  KEY `Task_ID` (`Task_ID`),
  KEY `Student_ID` (`Student_ID`),
  KEY `Reviewed_By` (`Reviewed_By`),
  CONSTRAINT `task_submission_ibfk_1` FOREIGN KEY (`Task_ID`) REFERENCES `task` (`Task_ID`),
  CONSTRAINT `task_submission_ibfk_2` FOREIGN KEY (`Student_ID`) REFERENCES `student` (`Student_ID`),
  CONSTRAINT `task_submission_ibfk_3` FOREIGN KEY (`Reviewed_By`) REFERENCES `student` (`Student_ID`),
  CONSTRAINT `task_submission_chk_1` CHECK ((`Review_Status` in (_utf8mb4'PENDING',_utf8mb4'APPROVED',_utf8mb4'REJECTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_submission`
--

LOCK TABLES `task_submission` WRITE;
/*!40000 ALTER TABLE `task_submission` DISABLE KEYS */;
INSERT INTO `task_submission` VALUES ('SUB001','T001','S006','2026-09-01 15:58:16','playlist.pdf','Playlist prepared for the event','APPROVED','S004','2026-09-09 19:00:00'),('SUB002','T003','S006','2026-09-01 15:58:16','festival_teaser.mp4','Final teaser video','APPROVED','S004','2026-09-11 20:00:00'),('SUB003','T005','S001','2026-09-01 15:58:16','codefest_poster.png','Poster design completed','PENDING',NULL,NULL);
/*!40000 ALTER TABLE `task_submission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `upcoming_events`
--

DROP TABLE IF EXISTS `upcoming_events`;
/*!50001 DROP VIEW IF EXISTS `upcoming_events`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `upcoming_events` AS SELECT 
 1 AS `Event_ID`,
 1 AS `Event_Name`,
 1 AS `Club_Name`,
 1 AS `Event_Date`,
 1 AS `Venue`,
 1 AS `Capacity`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `club_member_overview`
--

/*!50001 DROP VIEW IF EXISTS `club_member_overview`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `club_member_overview` AS select `c`.`Club_ID` AS `Club_ID`,`c`.`Club_Name` AS `Club_Name`,`s`.`Student_ID` AS `Student_ID`,`s`.`Name` AS `Name`,`r`.`Role_Name` AS `Role_Name`,`m`.`Status` AS `Status` from (((`club` `c` join `membership` `m` on((`c`.`Club_ID` = `m`.`Club_ID`))) join `student` `s` on((`m`.`Student_ID` = `s`.`Student_ID`))) join `role` `r` on((`m`.`Role_ID` = `r`.`Role_ID`))) where (`m`.`Status` = 'ACTIVE') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `club_task_progress`
--

/*!50001 DROP VIEW IF EXISTS `club_task_progress`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `club_task_progress` AS select `c`.`Club_ID` AS `Club_ID`,`c`.`Club_Name` AS `Club_Name`,count(`t`.`Task_ID`) AS `Total_Tasks`,sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end)) AS `Completed_Tasks`,round(((100 * sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end))) / nullif(count(`t`.`Task_ID`),0)),2) AS `Completion_Percentage` from (`club` `c` left join `task` `t` on((`c`.`Club_ID` = `t`.`Club_ID`))) group by `c`.`Club_ID`,`c`.`Club_Name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `department_task_progress`
--

/*!50001 DROP VIEW IF EXISTS `department_task_progress`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `department_task_progress` AS select `d`.`Department_ID` AS `Department_ID`,`d`.`Department_Name` AS `Department_Name`,count(`t`.`Task_ID`) AS `Total_Tasks`,sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end)) AS `Completed_Tasks`,round(((100 * sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end))) / nullif(count(`t`.`Task_ID`),0)),2) AS `Completion_Percentage` from (`department` `d` left join `task` `t` on((`d`.`Department_ID` = `t`.`Department_ID`))) group by `d`.`Department_ID`,`d`.`Department_Name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `student_task_summary`
--

/*!50001 DROP VIEW IF EXISTS `student_task_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `student_task_summary` AS select `s`.`Student_ID` AS `Student_ID`,`s`.`Name` AS `Name`,count(`ta`.`Task_ID`) AS `Total_Tasks`,sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end)) AS `Completed_Tasks`,sum((case when (`t`.`Status` = 'IN_PROGRESS') then 1 else 0 end)) AS `In_Progress_Tasks`,sum((case when (`t`.`Status` = 'TODO') then 1 else 0 end)) AS `Todo_Tasks` from ((`student` `s` left join `task_assignment` `ta` on((`s`.`Student_ID` = `ta`.`Student_ID`))) left join `task` `t` on((`ta`.`Task_ID` = `t`.`Task_ID`))) group by `s`.`Student_ID`,`s`.`Name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `upcoming_events`
--

/*!50001 DROP VIEW IF EXISTS `upcoming_events`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `upcoming_events` AS select `e`.`Event_ID` AS `Event_ID`,`e`.`Event_Name` AS `Event_Name`,`c`.`Club_Name` AS `Club_Name`,`e`.`Event_Date` AS `Event_Date`,`e`.`Venue` AS `Venue`,`e`.`Capacity` AS `Capacity` from (`event` `e` join `club` `c` on((`e`.`Club_ID` = `c`.`Club_ID`))) where ((`e`.`Status` = 'UPCOMING') and (`e`.`Event_Date` > now())) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 12:51:53
