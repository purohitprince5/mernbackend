const express = require("express");
const router = express.Router();
const Book = require("../models/book");

// =========================
// CREATE Book
// =========================
router.post("/", async (req, res) => {
  try {
    // safety check
    if (!req.body) {
      return res.status(400).json({ message: "No data received" });
    }

    const newBook = new Book({
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      bookFile: req.body.bookFile, // filename only
    });

    await newBook.save();

    res.status(201).json({
      message: "Book added successfully",
      book: newBook,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// GET ALL Books
// =========================
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// GET SINGLE Book
// =========================
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// UPDATE Book
// =========================
router.put("/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// DELETE Book
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
