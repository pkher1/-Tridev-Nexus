// ==========================================
// Quality Issue Web Form Script (with Multi-Attach Fix)
// ==========================================

function DEBUG_LOG(...args) {
    console.log("%c[DEBUG]", "color: #00bcd4; font-weight: bold;", ...args);
}


const CONFIG = {
    dealerField: 'custom_store__fofo_name',
    registrationField: 'custom_vehicle_registration_no',
    subjectField: 'subject',
    hideSubject: false,
    prefix: 'Quality Issue',
    dealerIssueTypeField: 'custom_dealer_issue_type',
    childTableField: 'custom_technical_issue_categories',
    categoryField: 'technical_issue_category',
    subCategoryField: 'technical_issue_sub_category',
    photoField: 'photovideo_evidance',
    mappingDoctype: 'Technical Issue Category Mapping',
    attachFields: ['custom_image_1', 'custom_image_2', 'custom_image_3']
};

// Track ongoing updates to prevent duplicate calls
let updating_rows = new Set();

// ==========================================
// Web Form Initialization
// ==========================================
frappe.web_form.after_load = () => {
    console.log("Web Form Loaded");
    
    // Create a MutationObserver to watch for modal creation
    const observer = new MutationObserver(function(mutations) {
        const modal = document.querySelector('.modal.show .file-uploader-dialog');
        if (modal) {
            handleFileUploader();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    function handleFileUploader() {
        setTimeout(function() {
            // Find the modal footer
            const modalFooter = document.querySelector('.modal.show .modal-footer');
            if (!modalFooter) return;
            
            // Hide "Set all private" button
            const buttons = modalFooter.querySelectorAll('.btn-link');
            buttons.forEach(function(btn) {
                if (btn.textContent.includes('Set all private')) {
                    btn.style.display = 'none';
                }
            });
            
            // Auto-click "Set all public" when files are added
            const fileList = document.querySelector('.modal.show .file-uploader-list');
            if (fileList) {
                const listObserver = new MutationObserver(function() {
                    const items = fileList.querySelectorAll('.file-upload-item');
                    if (items.length > 0) {
                        const setPublicBtn = Array.from(buttons).find(btn => 
                            btn.textContent.includes('Set all public')
                        );
                        if (setPublicBtn && !setPublicBtn.classList.contains('auto-clicked')) {
                            setPublicBtn.classList.add('auto-clicked');
                            setPublicBtn.click();
                        }
                    }
                });
                
                listObserver.observe(fileList, {
                    childList: true,
                    subtree: true
                });
            }
        }, 300);
    }

    if (CONFIG.hideSubject) {
        frappe.web_form.set_df_property(CONFIG.subjectField, 'hidden', 1);
        frappe.web_form.set_df_property(CONFIG.subjectField, 'read_only', 1);
    }

    generateSubject();
    setup_child_table_category_listener();
    setup_dealer_issue_type_filter();
    force_attach_link_filter_on_click();
    make_child_table_fields_mandatory();
};

// ==========================================
// Make Child Table Fields Mandatory
// ==========================================
function make_child_table_fields_mandatory() {
    setTimeout(() => {
        const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
        if (!child_table || !child_table.grid) {
            console.warn("Child table not ready yet.");
            return;
        }

        // Set fields as mandatory in the child table
        child_table.grid.update_docfield_property(CONFIG.categoryField, 'reqd', 1);
        child_table.grid.update_docfield_property(CONFIG.subCategoryField, 'reqd', 1);
        child_table.grid.update_docfield_property(CONFIG.photoField, 'reqd', 1);

        console.log("Child table fields marked as mandatory");
    }, 500);
}

// ==========================================
// Auto Subject Generator
// ==========================================
frappe.web_form.on(CONFIG.dealerField, generateSubject);
frappe.web_form.on(CONFIG.registrationField, generateSubject);

function generateSubject() {
    const dealer = frappe.web_form.get_value(CONFIG.dealerField) || '';
    const reg = frappe.web_form.get_value(CONFIG.registrationField) || '';
    let subject = CONFIG.prefix;

    if (dealer && reg) subject += ` - ${dealer} - ${reg}`;
    else if (dealer) subject += ` - ${dealer}`;
    else if (reg) subject += ` - ${reg}`;

    frappe.web_form.set_value(CONFIG.subjectField, subject);
}

// ==========================================
// Setup Dealer Issue Type Filter for Link Field
// ==========================================
function setup_dealer_issue_type_filter() {
    DEBUG_LOG("🚀 setup_dealer_issue_type_filter() called");

    setTimeout(() => {
        const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];

        DEBUG_LOG("📌 child_table found?", !!child_table);
        DEBUG_LOG("📌 child_table.grid found?", !!child_table?.grid);

        if (!child_table || !child_table.grid) {
            console.warn("❌ Child table not ready yet for filter setup.");
            return;
        }

        // Override the grid's add_row to set up filters
        const original_add_row = child_table.grid.add_row;

        if (!child_table.grid.__filter_patched) {
            child_table.grid.__filter_patched = true;

            DEBUG_LOG("🛠️ Patching grid.add_row() to attach filters on new row");

            child_table.grid.add_row = function () {
                DEBUG_LOG("➕ Add Row clicked - grid.add_row triggered");

                const row = original_add_row.apply(this, arguments);

                DEBUG_LOG("🧾 New row returned:", row);
                setup_link_field_filter(row);

                return row;
            };
        } else {
            DEBUG_LOG("⚠️ grid.add_row already patched, skipping patching again");
        }

        // Also set up filters for existing rows
        if (child_table.grid.grid_rows && child_table.grid.grid_rows.length > 0) {
            DEBUG_LOG(`📌 Existing rows found: ${child_table.grid.grid_rows.length}`);
            child_table.grid.grid_rows.forEach((row, idx) => {
                DEBUG_LOG(`🔁 Attaching filter for existing row #${idx + 1}`, row);
                setup_link_field_filter(row);
            });
        } else {
            DEBUG_LOG("📌 No existing rows found yet");
        }

        DEBUG_LOG("✅ Dealer Issue Type filter setup complete");
    }, 1000);
}

function force_attach_link_filter_on_click() {
    DEBUG_LOG("🧲 force_attach_link_filter_on_click() initialized");

    setTimeout(() => {
        const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];

        DEBUG_LOG("📌 child_table exists?", !!child_table);
        DEBUG_LOG("📌 child_table.grid exists?", !!child_table?.grid);

        if (!child_table || !child_table.grid) {
            console.warn("❌ Child table grid not found");
            return;
        }

        // IMPORTANT: In Web Forms, use grid.get_field(fieldname)
        const link_field = child_table.grid.get_field(CONFIG.categoryField);

        DEBUG_LOG("🔍 link_field from grid.get_field():", link_field);

        if (!link_field) {
            console.warn("❌ Could not find link field using grid.get_field()");
            return;
        }

        // Attach query here (global for all rows)
        link_field.get_query = function () {
            const dealer_issue_type = frappe.web_form.get_value(CONFIG.dealerIssueTypeField);

            DEBUG_LOG("🔥 GLOBAL get_query triggered for Issue Category");
            DEBUG_LOG("📌 dealer_issue_type:", dealer_issue_type);

            if (!dealer_issue_type) {
                DEBUG_LOG("⚠️ Dealer Issue Type missing -> block all results");
                return { filters: [["name", "=", "___NONE___"]] };
            }

            if (dealer_issue_type === "Non Technical") {
                DEBUG_LOG("✅ Filter applied: Only Non Technical");
                return {
                    filters: [["technical_issue_category", "=", "Non Technical"]]
                };
            }

            if (dealer_issue_type === "Transit") {
                DEBUG_LOG("✅ Filter applied: Only Transit");
                return {
                    filters: [["technical_issue_category", "=", "Transit"]]
                };
            }

            if (dealer_issue_type === "Technical") {
                DEBUG_LOG("✅ Filter applied: Technical only (exclude Non Technical + Transit)");
                return {
                    filters: [["technical_issue_category", "not in", ["Non Technical", "Transit"]]]
                };
            }

            DEBUG_LOG("⚠️ Unknown Dealer Issue Type:", dealer_issue_type);
            return { filters: [["name", "=", "___NONE___"]] };
        };

        DEBUG_LOG("✅ GLOBAL Link filter attached using child_table.grid.get_field()");
    }, 1200);
}




function setup_link_field_filter(grid_row) {
    DEBUG_LOG("🔧 setup_link_field_filter() called with row:", grid_row);

    if (!grid_row || !grid_row.grid || !grid_row.grid.fields_dict) {
        console.warn("❌ Invalid grid_row structure");
        return;
    }

    const field = grid_row.grid.fields_dict[CONFIG.categoryField];
    if (!field || !field.df) {
        console.warn("❌ Link field object not found in grid row");
        return;
    }

    DEBUG_LOG("✅ Link field found. Attaching get_query...");

    field.df.get_query = function () {
        const dealer_issue_type = frappe.web_form.get_value(CONFIG.dealerIssueTypeField);

        DEBUG_LOG("🔥 get_query() triggered");
        DEBUG_LOG("📌 dealer_issue_type:", dealer_issue_type);

        if (!dealer_issue_type) {
            DEBUG_LOG("⚠️ No Dealer Issue Type selected, blocking results");
            return { filters: [["name", "=", "___NONE___"]] };
        }

        if (dealer_issue_type === "Non Technical") {
            DEBUG_LOG("✅ Filter applied: Only Non Technical");
            return {
                filters: [["technical_issue_category", "=", "Non Technical"]]
            };
        }

        if (dealer_issue_type === "Transit") {
            DEBUG_LOG("✅ Filter applied: Only Transit");
            return {
                filters: [["technical_issue_category", "=", "Transit"]]
            };
        }

        if (dealer_issue_type === "Technical") {
            DEBUG_LOG("✅ Filter applied: Only Technical (exclude Non Technical & Transit)");
            return {
                filters: [["technical_issue_category", "not in", ["Non Technical", "Transit"]]]
            };
        }

        DEBUG_LOG("⚠️ Unknown Dealer Issue Type:", dealer_issue_type);
        return { filters: [["name", "=", "___NONE___"]] };
    };

    DEBUG_LOG("✅ get_query attached successfully");
}




// ==========================================
// Watch Dealer Issue Type Changes
// ==========================================
frappe.web_form.on(CONFIG.dealerIssueTypeField, function() {
    console.log("🔄 Dealer Issue Type changed");
    
    // Clear existing child table rows when issue type changes
    const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
    if (child_table && child_table.grid) {
        child_table.grid.df.data = [];
        child_table.grid.refresh();
        frappe.msgprint({
            title: 'Info',
            message: 'Issue Categories have been cleared. Please add new categories based on selected Issue Type.',
            indicator: 'blue'
        });
    }
    
    // Re-setup filters for all rows
    setTimeout(() => {
        setup_dealer_issue_type_filter();
    }, 300);
});

// ==========================================
// Setup Dynamic Subcategory Updates (For Link Field)
// ==========================================
function setup_child_table_category_listener() {
    setTimeout(() => {
        const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
        if (!child_table || !child_table.grid) {
            console.warn("Child table not ready yet.");
            return;
        }

        const grid_wrapper = $(child_table.grid.wrapper);
        
        // Use only ONE event listener - awesomplete-selectcomplete is most reliable for Link fields
        grid_wrapper.on("awesomplete-selectcomplete", `[data-fieldname='${CONFIG.categoryField}']`, function(e) {
            console.log("✅ Category selected via awesomplete");
            
            const $target = $(e.target);
            const grid_row = $target.closest(".grid-row").data("grid_row");
            
            if (grid_row && grid_row.doc) {
                // Use setTimeout with debouncing to prevent multiple calls
                setTimeout(() => {
                    update_subcategories_for_row(grid_row);
                }, 300);
            }
        });

        console.log("✅ Child table category listener attached (Link field mode)");
    }, 1000);
}

// ==========================================
// Update Subcategories for a Grid Row
// ==========================================
function update_subcategories_for_row(grid_row) {
    if (!grid_row || !grid_row.doc) {
        console.warn("❌ Invalid grid row");
        return;
    }

    const selected_category_name = grid_row.doc[CONFIG.categoryField];
    const row_id = grid_row.doc.name || grid_row.doc.idx;
    
    // Create unique key for this row update
    const update_key = `${row_id}_${selected_category_name}`;
    
    // Check if already updating this row
    if (updating_rows.has(update_key)) {
        console.log("⏭️ Skipping duplicate update for:", update_key);
        return;
    }

    console.log("🔍 Updating subcategories for:", {
        categoryName: selected_category_name,
        rowId: row_id
    });

    if (!selected_category_name) {
        console.log("⚠️ No category selected");
        return;
    }

    // Check if dealer issue type is selected
    const dealer_issue_type = frappe.web_form.get_value(CONFIG.dealerIssueTypeField);
    if (!dealer_issue_type) {
        console.warn("⚠️ No dealer issue type selected");
        frappe.msgprint({
            title: 'Warning',
            message: 'Please select Dealer Issue Type first.',
            indicator: 'orange'
        });
        return;
    }

    // Mark this row as being updated
    updating_rows.add(update_key);

    // First, fetch the full document to get the technical_issue_category value
    frappe.call({
        method: 'frappe.client.get',
        args: {
            doctype: CONFIG.mappingDoctype,
            name: selected_category_name
        },
        callback: function(r) {
            console.log("📄 Category document fetched:", r.message);
            
            if (r.message && r.message.technical_issue_category) {
                const category_value = r.message.technical_issue_category;
                console.log("📌 Category value:", category_value);
                
                // Now fetch all mappings with this category
                fetch_subcategories_by_category(grid_row, category_value, dealer_issue_type, update_key);
            } else {
                console.error("❌ Could not fetch category document or technical_issue_category field is missing");
                // Remove from updating set
                updating_rows.delete(update_key);
            }
        },
        error: function(err) {
            console.error("❌ Error fetching category document:", err);
            // Remove from updating set
            updating_rows.delete(update_key);
        }
    });
}

// ==========================================
// Fetch Subcategories by Category Value
// ==========================================
function fetch_subcategories_by_category(grid_row, category_value, dealer_issue_type, update_key) {
    frappe.call({
        method: 'drivex.api.public_list.public_get_list',
        args: {
            doctype: CONFIG.mappingDoctype,
            fields: ['technical_issue_sub_category'],
            filters: [
                ['technical_issue_category', '=', category_value],
                ['technical_issue_sub_category', '!=', '']
            ],
            order_by: 'technical_issue_sub_category asc',
            limit_page_length: 2000
        },
        callback: function (r) {
            console.log("📊 Subcategory API response:", r);
            
            if (r.message && r.message.length > 0) {
                let unique_subcategories = [...new Set(r.message.map(d => d.technical_issue_sub_category))].filter(Boolean);
                let subcategory_options = ['', ...unique_subcategories].join('\n');

                const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
                child_table.grid.update_docfield_property(
                    CONFIG.subCategoryField,
                    'options',
                    subcategory_options
                );

                // Clear the current subcategory value
                grid_row.doc[CONFIG.subCategoryField] = '';
                grid_row.refresh_field(CONFIG.subCategoryField);
                
                console.log(`✅ Updated subcategories for ${category_value}:`, unique_subcategories);
            } else {
                const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
                child_table.grid.update_docfield_property(CONFIG.subCategoryField, 'options', '');
                grid_row.doc[CONFIG.subCategoryField] = '';
                grid_row.refresh_field(CONFIG.subCategoryField);
                console.log(`⚠️ No subcategories found for ${category_value}`);
            }
            
            // Remove from updating set after completion
            updating_rows.delete(update_key);
        },
        error: function(err) {
            console.error("❌ Error fetching subcategories:", err);
            // Remove from updating set
            updating_rows.delete(update_key);
        }
    });
}

// ==========================================
// Validation before submission
// ==========================================
frappe.web_form.validate = () => {
    const data = frappe.web_form.get_values();
    
    // Check subject
    if (!data.subject || data.subject.trim() === '') {
        frappe.msgprint({
            title: 'Missing Information',
            message: 'Subject could not be generated. Please fill in Dealer Name and Vehicle Registration Number.',
            indicator: 'red'
        });
        return false;
    }

    // Check dealer issue type
    if (!data[CONFIG.dealerIssueTypeField]) {
        frappe.msgprint({
            title: 'Missing Information',
            message: 'Please select Dealer Issue Type.',
            indicator: 'red'
        });
        return false;
    }

    // Check child table has at least one row
    const child_data = data[CONFIG.childTableField];
    if (!child_data || child_data.length === 0) {
        frappe.msgprint({
            title: 'Missing Information',
            message: 'Please add at least one Issue Category.',
            indicator: 'red'
        });
        return false;
    }

    // Validate each row in child table
    for (let i = 0; i < child_data.length; i++) {
        const row = child_data[i];
        
        if (!row[CONFIG.categoryField]) {
            frappe.msgprint({
                title: 'Missing Information',
                message: `Row ${i + 1}: Issue Category is mandatory.`,
                indicator: 'red'
            });
            return false;
        }

        if (!row[CONFIG.subCategoryField]) {
            frappe.msgprint({
                title: 'Missing Information',
                message: `Row ${i + 1}: Issue Sub Category is mandatory.`,
                indicator: 'red'
            });
            return false;
        }

        if (!row[CONFIG.photoField]) {
            frappe.msgprint({
                title: 'Missing Information',
                message: `Row ${i + 1}: Photo/Video Evidence is mandatory.`,
                indicator: 'red'
            });
            return false;
        }
    }

    return true;
};