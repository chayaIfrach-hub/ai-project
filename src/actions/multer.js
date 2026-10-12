export async function uploadFile(formData) {
	try {
		const response = await fetch("/api/multer", {
			method: "POST",
			body: formData,
		});

		const result = await response.json();

		if (!response.ok) {
			return { error: result.error || "שליחת המועמדות נכשלה." };
		}

		return { success: result.message || "המועמדות נשלחה בהצלחה." };
	} catch (error) {
		console.error("Resume upload failed:", error);
		return { error: "לא ניתן לשלוח את המועמדות כרגע. נסה שוב." };
	}
}
