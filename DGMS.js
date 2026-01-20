// ==========================================
// Quality Issue Web Form Script (with Multi-Attach Fix)
// ==========================================

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
// Watch Dealer Issue Type Changes
// ==========================================
frappe.web_form.on(CONFIG.dealerIssueTypeField, function() {
    console.log("Dealer Issue Type changed");
    
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

        // Method 1: Listen to awesomplete-selectcomplete event (for Link fields)
        const grid_wrapper = $(child_table.grid.wrapper);
        
        grid_wrapper.on("awesomplete-selectcomplete", `[data-fieldname='${CONFIG.categoryField}']`, function(e) {
            console.log("Category selected via awesomplete:", e);
            const grid_row = $(this).closest(".grid-row").data("grid_row");
            if (grid_row && grid_row.doc) {
                setTimeout(() => {
                    update_subcategories_for_row(grid_row);
                }, 300);
            }
        });

        // Method 2: Listen to blur event (backup method)
        grid_wrapper.on("blur", `[data-fieldname='${CONFIG.categoryField}'] input`, function() {
            console.log("Category field blur event");
            const grid_row = $(this).closest(".grid-row").data("grid_row");
            if (grid_row && grid_row.doc && grid_row.doc[CONFIG.categoryField]) {
                setTimeout(() => {
                    update_subcategories_for_row(grid_row);
                }, 300);
            }
        });

        // Method 3: Direct change listener
        grid_wrapper.on("change", `[data-fieldname='${CONFIG.categoryField}'] input`, function() {
            console.log("Category field change event");
            const grid_row = $(this).closest(".grid-row").data("grid_row");
            if (grid_row && grid_row.doc && grid_row.doc[CONFIG.categoryField]) {
                setTimeout(() => {
                    update_subcategories_for_row(grid_row);
                }, 300);
            }
        });

        console.log("Child table category listener attached (Link field mode)");
    }, 1000);
}

// ==========================================
// Update Subcategories for a Grid Row
// ==========================================
function update_subcategories_for_row(grid_row) {
    if (!grid_row || !grid_row.doc) {
        console.warn("Invalid grid row");
        return;
    }

    const selected_category = grid_row.doc[CONFIG.categoryField];
    const dealer_issue_type = frappe.web_form.get_value(CONFIG.dealerIssueTypeField);
    
    console.log("Updating subcategories for:", {
        category: selected_category,
        issueType: dealer_issue_type
    });

    if (!selected_category) {
        console.log("No category selected");
        return;
    }

    if (!dealer_issue_type) {
        console.warn("No dealer issue type selected");
        frappe.msgprint({
            title: 'Warning',
            message: 'Please select Dealer Issue Type first.',
            indicator: 'orange'
        });
        return;
    }

    frappe.call({
        method: 'drivex.api.public_list.public_get_list',
        args: {
            doctype: CONFIG.mappingDoctype,
            fields: ['technical_issue_sub_category'],
            filters: [
                ['dealer_issue_type', '=', dealer_issue_type],
                ['name', '=', selected_category], // 👈 Since category is a Link, use 'name'
                ['technical_issue_sub_category', '!=', '']
            ],
            order_by: 'technical_issue_sub_category asc',
            limit_page_length: 2000
        },
        callback: function (r) {
            console.log("Subcategory API response:", r);
            
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
                
                console.log(`Updated subcategories for ${selected_category} (${dealer_issue_type}):`, unique_subcategories);
            } else {
                const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
                child_table.grid.update_docfield_property(CONFIG.subCategoryField, 'options', '');
                grid_row.doc[CONFIG.subCategoryField] = '';
                grid_row.refresh_field(CONFIG.subCategoryField);
                console.log(`No subcategories found for ${selected_category} (${dealer_issue_type})`);
                
                frappe.msgprint({
                    title: 'Info',
                    message: `No subcategories found for "${selected_category}"`,
                    indicator: 'blue'
                });
            }
        },
        error: function(err) {
            console.error("Error fetching subcategories:", err);
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