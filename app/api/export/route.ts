import ExcelJS from "exceljs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] API received body:", JSON.stringify(body).substring(0, 500))

    const headers = body.headers || []
    const entries = Array.isArray(body) ? body : body.entries

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      console.log("[v0] Invalid entries:", entries)
      return new Response(JSON.stringify({ error: "No valid entries provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("[v0] Headers:", headers)
    console.log("[v0] Number of rows:", entries.length)

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Habits")

    if (headers.length > 0) {
      const headerRow = sheet.addRow(headers)
      // Make first header "HABITS" bold and uppercase
      const firstHeaderCell = headerRow.getCell(1)
      if (firstHeaderCell) {
        firstHeaderCell.value = "HABITS"
        firstHeaderCell.font = { bold: true, size: 12 }
      }
      // Other headers (Day 1, Day 2, etc) are normal, not bold
      for (let i = 2; i <= headers.length; i++) {
        const cell = headerRow.getCell(i)
        if (cell) {
          cell.font = { size: 11 } // Normal font, not bold
        }
      }
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      }
    }

    entries.forEach((entry: Record<string, string>) => {
      const rowData = headers.map((header: string) => {
        return entry[header] || ""
      })
      const row = sheet.addRow(rowData)

      const firstCell = row.getCell(1)
      if (firstCell) {
        firstCell.font = { bold: true } // Bold only, no uppercase
      }

      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) return // Skip first column

        const value = cell.value?.toString() || ""
        if (value === "✓" || value === "Yes") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF90EE90" }, // Light green
          }
          cell.font = { bold: true }
          cell.alignment = { horizontal: "center", vertical: "middle" }
        } else if (value === "✗" || value === "No") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFB6C6" }, // Light red
          }
          cell.font = { bold: true }
          cell.alignment = { horizontal: "center", vertical: "middle" }
        }
      })
    })

    // Auto-fit columns
    headers.forEach((_: string, index: number) => {
      sheet.getColumn(index + 1).width = 15
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const uint8Array = new Uint8Array(buffer as ArrayBuffer)

    console.log("[v0] Export successful, buffer size:", uint8Array.length)

    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=habits-${new Date().toISOString().split("T")[0]}.xlsx`,
      },
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return new Response(
      JSON.stringify({ error: `Failed to export data: ${error instanceof Error ? error.message : String(error)}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
