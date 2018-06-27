require 'rubygems'
require 'rest-client'
require 'json'

# User credentials
user = ENV["BROWSERSTACK_USER"]
key = ENV["BROWSERSTACK_ACCESSKEY"]

# API base URL
base_url = "https://#{user}:#{key}@api-cloud.browserstack.com/app-automate/"



# Upload App
results = RestClient.post(
	base_url + "upload",
	file: File.new("./Calculator.apk", 'rb')
)
app_url = JSON.parse(results.body)['app_url']



# Upload Tests
results = RestClient.post(
	base_url + "espresso/test-suite",
	file: File.new("./CalculatorTest.apk", 'rb'),
)
test_url = JSON.parse(results.body)['test_url']



# Execute Tests
results = RestClient.post(
	base_url + "espresso/build",
	{ 
		"app": app_url, 
		"testSuite": test_url,
		"devices": [
			"Google Pixel-8.0", 
			"Google Pixel-7.1"
		], 
		"deviceLogs": true 
	}.to_json,
	content_type: :json
)
build_id = JSON.parse(results.body)['build_id']



# Wait for tests to finish
build = RestClient.get(base_url + "/espresso/builds/" + build_id)
status = JSON.parse(build.body)['status']

while status != 'done' do
	sleep 5
	build = RestClient.get(base_url + "/espresso/builds/" + build_id)
	status = JSON.parse(build.body)['status']
end



# Retrieve test results
puts build.body
