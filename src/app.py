from flask import Flask, render_template_string

app = Flask(__name__)

@app.route('/')
def webinar_form():
    html_code = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Webinar Registration Form</title>
    </head>
    <body>
        <div class="visme_d"
             data-title="Webinar Registration Form"
             data-url="g7ddqxx0-untitled-project?fullPage=true"
             data-domain="forms"
             data-full-page="true"
             data-min-height="100vh"
             data-form-id="133190">
        </div>

        <script src="https://static.visme.co/forms/vismeforms-embed.js"></script>
    </body>
    </html>
    """
    return render_template_string(html_code)

if __name__ == '__main__':
    app.run(debug=True)
